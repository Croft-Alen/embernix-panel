import {
  createHash,
} from "node:crypto";

import {
  posix,
} from "node:path";

import {
  Unzip,
  UnzipInflate,
  zipSync,
} from "fflate";

import {
  getR2StorageProvider,
} from "@/server/providers/storage/r2-storage-provider";

import {
  deleteWorkerWebsiteFileMetadata,
  findWorkerWebsiteFileByPath,
  findWorkerWebsiteFiles,
  requireWorkerWebsite,
  upsertWorkerWebsiteFiles,
} from "@/server/repositories/file-worker-repository";

const MAX_ARCHIVE_BYTES =
  250 *
  1024 *
  1024;

const MAX_EXTRACTED_BYTES =
  1024 *
  1024 *
  1024;

const MAX_SINGLE_FILE_BYTES =
  150 *
  1024 *
  1024;

const MAX_FILES =
  10_000;

const MAX_PATH_LENGTH =
  1024;

const MAX_DEPTH =
  40;

const UPLOAD_CONCURRENCY =
  Math.max(
    1,
    Math.min(
      24,
      Number(
        process.env
          .FILE_OPERATION_R2_CONCURRENCY ??
          12
      )
    )
  );

const METADATA_BATCH_SIZE =
  100;

const PROGRESS_INTERVAL_MS =
  500;

const CANCEL_CHECK_INTERVAL_MS =
  1500;

type ProgressCallback = (
  input: {
    current:
      number;

    total:
      number;

    percent:
      number;

    message:
      string;
  }
) => Promise<void>;

type CancelCheck = () =>
  Promise<boolean>;

type ExtractZipPayload = {
  archivePath:
    string;

  destinationPath?:
    string;

  overwrite?:
    boolean;

  deleteArchiveAfter?:
    boolean;
};

type CreateZipPayload = {
  paths:
    string[];

  archivePath:
    string;

  overwrite?:
    boolean;
};

type UploadedEntry = {
  websiteId:
    string;

  path:
    string;

  objectKey:
    string;

  contentType:
    string;

  sizeBytes:
    number;

  etag?:
    string;

  checksumSha256:
    string;
};

export async function runExtractZipOperation(
  input: {
    websiteId:
      string;

    payload:
      ExtractZipPayload;

    onProgress:
      ProgressCallback;

    isCanceled:
      CancelCheck;
  }
) {
  await requireWorkerWebsite(
    input.websiteId
  );

  const archivePath =
    normalizeWebsitePath(
      input.payload.archivePath
    );

  if (
    !archivePath
      .toLowerCase()
      .endsWith(
        ".zip"
      )
  ) {
    throw new Error(
      "Only ZIP archives can be extracted."
    );
  }

  const destinationPath =
    normalizeDestinationPath(
      input.payload
        .destinationPath
    );

  const overwrite =
    input.payload.overwrite ??
    true;

  await input.onProgress({
    current:
      0,

    total:
      0,

    percent:
      1,

    message:
      "Connecting to archive",
  });

  const archiveMetadata =
    await findWorkerWebsiteFileByPath(
      input.websiteId,
      archivePath
    );

  if (
    !archiveMetadata
  ) {
    throw new Error(
      "Archive file was not found."
    );
  }

  const storage =
    getR2StorageProvider();

  const archiveObject =
    await storage.getStream(
      archiveMetadata.object_key
    );

  if (
    !archiveObject
  ) {
    throw new Error(
      "Archive object was not found in storage."
    );
  }

  if (
    archiveObject.contentLength >
    MAX_ARCHIVE_BYTES
  ) {
    throw new Error(
      "ZIP archive exceeds the current extraction limit."
    );
  }

  const existingFiles =
    await findWorkerWebsiteFiles(
      input.websiteId
    );

  const existingPaths =
    new Set(
      existingFiles.map(
        (
          file
        ) =>
          file.path
      )
    );

  let bytesRead =
    0;

  let extractedBytes =
    0;

  let discoveredFiles =
    0;

  let uploadedFiles =
    0;

  let extractedFiles =
    0;

  let overwrittenFiles =
    0;

  let skippedFiles =
    0;

  let fatalError:
    Error | null =
    null;

  let sourceFinished =
    false;

  const uploadPromises =
    new Set<
      Promise<void>
    >();

  const metadataRows:
    UploadedEntry[] =
    [];

  const progress =
    createProgressReporter(
      input.onProgress
    );

  const isCanceled =
    createThrottledCancelCheck(
      input.isCanceled
    );

  const unzip =
    new Unzip(
      (
        file
      ) => {
        if (
          fatalError
        ) {
          return;
        }

        const rawName =
          file.name;

        if (
          rawName.endsWith(
            "/"
          )
        ) {
          file.ondata =
            (
              error
            ) => {
              if (
                error &&
                !fatalError
              ) {
                fatalError =
                  toError(
                    error
                  );
              }
            };

          file.start();

          return;
        }

        let safePath:
          string;

        let outputPath:
          string;

        try {
          safePath =
            validateArchiveEntryPath(
              rawName
            );

          outputPath =
            destinationPath
              ? normalizeWebsitePath(
                  `${destinationPath}/${safePath}`
                )
              : safePath;
        } catch (
          error
        ) {
          fatalError =
            toError(
              error
            );

          return;
        }

        discoveredFiles +=
          1;

        if (
          discoveredFiles >
          MAX_FILES
        ) {
          fatalError =
            new Error(
              `ZIP contains more than ${MAX_FILES.toLocaleString()} files.`
            );

          return;
        }

        const alreadyExists =
          existingPaths.has(
            outputPath
          );

        const shouldSkip =
          alreadyExists &&
          !overwrite;

        const chunks:
          Uint8Array[] =
          [];

        let fileBytes =
          0;

        file.ondata =
          (
            error,
            chunk,
            final
          ) => {
            if (
              error
            ) {
              if (
                !fatalError
              ) {
                fatalError =
                  toError(
                    error
                  );
              }

              return;
            }

            if (
              shouldSkip
            ) {
              if (
                final
              ) {
                skippedFiles +=
                  1;
              }

              return;
            }

            if (
              chunk.byteLength >
              0
            ) {
              fileBytes +=
                chunk.byteLength;

              extractedBytes +=
                chunk.byteLength;

              if (
                fileBytes >
                MAX_SINGLE_FILE_BYTES
              ) {
                fatalError =
                  new Error(
                    `ZIP entry "${outputPath}" exceeds the current single-file extraction limit.`
                  );

                return;
              }

              if (
                extractedBytes >
                MAX_EXTRACTED_BYTES
              ) {
                fatalError =
                  new Error(
                    "Extracted archive would exceed the current size limit."
                  );

                return;
              }

              chunks.push(
                chunk
              );
            }

            if (
              !final ||
              fatalError
            ) {
              return;
            }

            const body =
              concatChunks(
                chunks,
                fileBytes
              );

            const uploadPromise =
              uploadExtractedFile({
                websiteId:
                  input.websiteId,

                outputPath,

                body,

                alreadyExists,
              })
                .then(
                  (
                    result
                  ) => {
                    metadataRows.push(
                      result.metadata
                    );

                    uploadedFiles +=
                      1;

                    if (
                      result.alreadyExists
                    ) {
                      overwrittenFiles +=
                        1;
                    } else {
                      extractedFiles +=
                        1;
                    }

                    existingPaths.add(
                      outputPath
                    );
                  }
                )
                .catch(
                  (
                    error
                  ) => {
                    if (
                      !fatalError
                    ) {
                      fatalError =
                        toError(
                          error
                        );
                    }
                  }
                )
                .finally(
                  () => {
                    uploadPromises.delete(
                      uploadPromise
                    );
                  }
                );

            uploadPromises.add(
              uploadPromise
            );
          };

        file.start();
      }
    );

  unzip.register(
    UnzipInflate
  );

  async function uploadExtractedFile(
    uploadInput: {
      websiteId:
        string;

      outputPath:
        string;

      body:
        Uint8Array;

      alreadyExists:
        boolean;
    }
  ) {
    const objectKey =
      createWebsiteObjectKey(
        uploadInput.websiteId,
        uploadInput.outputPath
      );

    const checksum =
      createHash(
        "sha256"
      )
        .update(
          uploadInput.body
        )
        .digest(
          "hex"
        );

    const contentType =
      getContentType(
        uploadInput.outputPath
      );

    const saved =
      await storage.put({
        key:
          objectKey,

        body:
          uploadInput.body,

        contentType,

        metadata: {
          website_id:
            uploadInput.websiteId,

          website_path:
            uploadInput.outputPath,

          checksum_sha256:
            checksum,
        },
      });

    return {
      alreadyExists:
        uploadInput.alreadyExists,

      metadata: {
        websiteId:
          uploadInput.websiteId,

        path:
          uploadInput.outputPath,

        objectKey:
          saved.key,

        contentType,

        sizeBytes:
          uploadInput.body
            .byteLength,

        etag:
          saved.etag ??
          undefined,

        checksumSha256:
          checksum,
      },
    };
  }

  try {
    for await (
      const chunk
      of archiveObject.body
    ) {
      if (
        fatalError
      ) {
        throw fatalError;
      }

      if (
        await isCanceled()
      ) {
        return {
          canceled:
            true,

          extractedFiles,

          overwrittenFiles,

          skippedFiles,
        };
      }

      bytesRead +=
        chunk.byteLength;

      unzip.push(
        chunk,
        false
      );

      while (
        uploadPromises.size >=
        UPLOAD_CONCURRENCY
      ) {
        await Promise.race(
          uploadPromises
        );

        if (
          fatalError
        ) {
          throw fatalError;
        }
      }

      const readRatio =
        archiveObject.contentLength >
        0
          ? Math.min(
              1,
              bytesRead /
                archiveObject.contentLength
            )
          : 0;

      const uploadRatio =
        discoveredFiles >
        0
          ? Math.min(
              1,
              uploadedFiles /
                discoveredFiles
            )
          : 0;

      const percent =
        Math.min(
          94,
          Math.max(
            3,
            Math.round(
              3 +
              readRatio *
                47 +
              uploadRatio *
                44
            )
          )
        );

      await progress.report({
        current:
          0,

        total:
          0,

        percent,

        message:
          `Reading ${formatBytes(
            bytesRead
          )} / ${formatBytes(
            archiveObject.contentLength
          )} • ${uploadedFiles.toLocaleString()} files uploaded`,
      });
    }

    sourceFinished =
      true;

    unzip.push(
      new Uint8Array(
        0
      ),
      true
    );

    if (
      fatalError
    ) {
      throw fatalError;
    }

    await progress.force({
      current:
        uploadedFiles,

      total:
        discoveredFiles,

      percent:
        95,

      message:
        "Finishing extracted uploads",
    });

    await Promise.all(
      uploadPromises
    );

    if (
      fatalError
    ) {
      throw fatalError;
    }

    if (
      await input.isCanceled()
    ) {
      return {
        canceled:
          true,

        extractedFiles,

        overwrittenFiles,

        skippedFiles,
      };
    }

    await progress.force({
      current:
        uploadedFiles,

      total:
        discoveredFiles,

      percent:
        97,

      message:
        "Saving file metadata",
    });

    for (
      const batch
      of chunkArray(
        metadataRows,
        METADATA_BATCH_SIZE
      )
    ) {
      await upsertWorkerWebsiteFiles(
        batch
      );
    }

    if (
      input.payload
        .deleteArchiveAfter
    ) {
      await progress.force({
        current:
          uploadedFiles,

        total:
          discoveredFiles,

        percent:
          99,

        message:
          "Removing source archive",
      });

      await storage.delete(
        archiveMetadata.object_key
      );

      await deleteWorkerWebsiteFileMetadata(
        input.websiteId,
        archivePath
      );
    }

    await progress.force({
      current:
        uploadedFiles,

      total:
        discoveredFiles,

      percent:
        100,

      message:
        "Extraction completed",
    });

    return {
      canceled:
        false,

      archivePath:
        `/${archivePath}`,

      destinationPath:
        destinationPath
          ? `/${destinationPath}`
          : "/",

      extractedFiles,

      overwrittenFiles,

      skippedFiles,

      extractedBytes,

      archiveBytesRead:
        bytesRead,

      streamed:
        sourceFinished,
    };
  } catch (
    error
  ) {
    throw toError(
      error
    );
  }
}

export async function runCreateZipOperation(
  input: {
    websiteId:
      string;

    payload:
      CreateZipPayload;

    onProgress:
      ProgressCallback;

    isCanceled:
      CancelCheck;
  }
) {
  await requireWorkerWebsite(
    input.websiteId
  );

  if (
    !Array.isArray(
      input.payload.paths
    ) ||
    input.payload.paths
      .length ===
      0
  ) {
    throw new Error(
      "No files or folders were selected."
    );
  }

  const selectedPaths =
    Array.from(
      new Set(
        input.payload.paths.map(
          normalizeWebsitePath
        )
      )
    );

  const archivePath =
    normalizeWebsitePath(
      input.payload.archivePath
    );

  if (
    !archivePath
      .toLowerCase()
      .endsWith(
        ".zip"
      )
  ) {
    throw new Error(
      "Archive name must end with .zip."
    );
  }

  await input.onProgress({
    current:
      0,

    total:
      0,

    percent:
      2,

    message:
      "Preparing selected files",
  });

  const allFiles =
    await findWorkerWebsiteFiles(
      input.websiteId
    );

  const sourceFiles =
    allFiles.filter(
      (
        file
      ) =>
        selectedPaths.some(
          (
            selectedPath
          ) =>
            file.path ===
              selectedPath ||
            file.path.startsWith(
              `${selectedPath}/`
            )
        )
    );

  if (
    sourceFiles.length ===
    0
  ) {
    throw new Error(
      "No files were found for the selected items."
    );
  }

  if (
    sourceFiles.length >
    MAX_FILES
  ) {
    throw new Error(
      `Archive would contain more than ${MAX_FILES.toLocaleString()} files.`
    );
  }

  const existingArchive =
    allFiles.find(
      (
        file
      ) =>
        file.path ===
        archivePath
    );

  if (
    existingArchive &&
    !input.payload
      .overwrite
  ) {
    throw new Error(
      "An archive already exists at the destination."
    );
  }

  const storage =
    getR2StorageProvider();

  const zipEntries:
    Record<
      string,
      Uint8Array
    > = {};

  const total =
    sourceFiles.length;

  let processed =
    0;

  let sourceBytes =
    0;

  const chunks =
    chunkArray(
      sourceFiles,
      UPLOAD_CONCURRENCY
    );

  for (
    const chunk
    of chunks
  ) {
    if (
      await input.isCanceled()
    ) {
      return {
        canceled:
          true,
      };
    }

    const downloaded =
      await Promise.all(
        chunk.map(
          async (
            file
          ) => {
            const object =
              await storage.get(
                file.object_key
              );

            if (
              !object
            ) {
              throw new Error(
                `File "${file.path}" no longer exists in storage.`
              );
            }

            return {
              file,

              body:
                object.body,
            };
          }
        )
      );

    for (
      const item
      of downloaded
    ) {
      sourceBytes +=
        item.body.byteLength;

      const archiveEntryPath =
        getArchiveEntryPath(
          item.file.path,
          selectedPaths
        );

      zipEntries[
        archiveEntryPath
      ] =
        item.body;
    }

    processed +=
      downloaded.length;

    const ratio =
      processed /
      total;

    await input.onProgress({
      current:
        processed,

      total,

      percent:
        Math.max(
          5,
          Math.min(
            75,
            Math.round(
              5 +
              ratio *
                70
            )
          )
        ),

      message:
        `Loaded ${processed.toLocaleString()} of ${total.toLocaleString()} files`,
    });
  }

  if (
    await input.isCanceled()
  ) {
    return {
      canceled:
        true,
    };
  }

  await input.onProgress({
    current:
      total,

    total,

    percent:
      80,

    message:
      "Compressing ZIP archive",
  });

  let zip:
    Uint8Array;

  try {
    zip =
      zipSync(
        zipEntries,
        {
          level:
            6,
        }
      );
  } catch {
    throw new Error(
      "Failed to create ZIP archive."
    );
  }

  if (
    await input.isCanceled()
  ) {
    return {
      canceled:
        true,
    };
  }

  await input.onProgress({
    current:
      total,

    total,

    percent:
      90,

    message:
      "Saving ZIP archive",
  });

  const objectKey =
    createWebsiteObjectKey(
      input.websiteId,
      archivePath
    );

  const checksum =
    createHash(
      "sha256"
    )
      .update(
        zip
      )
      .digest(
        "hex"
      );

  const uploaded =
    await storage.put({
      key:
        objectKey,

      body:
        zip,

      contentType:
        "application/zip",

      metadata: {
        website_id:
          input.websiteId,

        website_path:
          archivePath,

        checksum_sha256:
          checksum,
      },
    });

  await upsertWorkerWebsiteFiles([
    {
      websiteId:
        input.websiteId,

      path:
        archivePath,

      objectKey:
        uploaded.key,

      contentType:
        "application/zip",

      sizeBytes:
        zip.byteLength,

      etag:
        uploaded.etag ??
        undefined,

      checksumSha256:
        checksum,
    },
  ]);

  await input.onProgress({
    current:
      total,

    total,

    percent:
      100,

    message:
      "Archive created",
  });

  return {
    canceled:
      false,

    archivePath:
      `/${archivePath}`,

    archivedFiles:
      total,

    sourceBytes,

    archiveBytes:
      zip.byteLength,
  };
}

function createProgressReporter(
  callback:
    ProgressCallback
) {
  let lastUpdate =
    0;

  return {
    async report(
      value:
        Parameters<
          ProgressCallback
        >[0]
    ) {
      const now =
        Date.now();

      if (
        now -
          lastUpdate <
        PROGRESS_INTERVAL_MS
      ) {
        return;
      }

      lastUpdate =
        now;

      await callback(
        value
      );
    },

    async force(
      value:
        Parameters<
          ProgressCallback
        >[0]
    ) {
      lastUpdate =
        Date.now();

      await callback(
        value
      );
    },
  };
}

function createThrottledCancelCheck(
  callback:
    CancelCheck
) {
  let lastCheck =
    0;

  let lastResult =
    false;

  return async () => {
    const now =
      Date.now();

    if (
      now -
        lastCheck <
      CANCEL_CHECK_INTERVAL_MS
    ) {
      return lastResult;
    }

    lastCheck =
      now;

    lastResult =
      await callback();

    return lastResult;
  };
}

function concatChunks(
  chunks:
    Uint8Array[],
  total:
    number
) {
  if (
    chunks.length ===
    1
  ) {
    return chunks[0];
  }

  const output =
    new Uint8Array(
      total
    );

  let offset =
    0;

  for (
    const chunk
    of chunks
  ) {
    output.set(
      chunk,
      offset
    );

    offset +=
      chunk.byteLength;
  }

  return output;
}

function getArchiveEntryPath(
  filePath:
    string,
  selectedPaths:
    string[]
) {
  const matching =
    selectedPaths
      .filter(
        (
          selected
        ) =>
          filePath ===
            selected ||
          filePath.startsWith(
            `${selected}/`
          )
      )
      .sort(
        (
          first,
          second
        ) =>
          second.length -
          first.length
      )[0];

  if (
    !matching
  ) {
    return filePath;
  }

  const selectedName =
    matching
      .split("/")
      .filter(
        Boolean
      )
      .pop();

  if (
    filePath ===
    matching
  ) {
    return (
      selectedName ??
      filePath
    );
  }

  const relative =
    filePath.slice(
      matching.length +
        1
    );

  return selectedName
    ? `${selectedName}/${relative}`
    : relative;
}

function validateArchiveEntryPath(
  value:
    string
) {
  if (
    value.includes(
      "\0"
    )
  ) {
    throw new Error(
      "ZIP contains an invalid path."
    );
  }

  const normalized =
    value
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /\/+/g,
        "/"
      );

  if (
    normalized.startsWith(
      "/"
    ) ||
    /^[a-zA-Z]:\//.test(
      normalized
    )
  ) {
    throw new Error(
      `ZIP contains an absolute path: "${value}".`
    );
  }

  const parts =
    normalized
      .split("/")
      .filter(
        Boolean
      );

  if (
    parts.some(
      (
        part
      ) =>
        part ===
          "." ||
        part ===
          ".."
    )
  ) {
    throw new Error(
      `ZIP contains an unsafe path: "${value}".`
    );
  }

  if (
    parts.length ===
      0 ||
    parts.length >
      MAX_DEPTH
  ) {
    throw new Error(
      `ZIP contains an invalid path: "${value}".`
    );
  }

  const path =
    parts.join(
      "/"
    );

  if (
    path.length >
    MAX_PATH_LENGTH
  ) {
    throw new Error(
      "ZIP contains a path that is too long."
    );
  }

  return path;
}

function normalizeDestinationPath(
  value?:
    string
) {
  if (
    !value ||
    value.trim() ===
      "/"
  ) {
    return "";
  }

  return normalizeWebsitePath(
    value
  );
}

function normalizeWebsitePath(
  value:
    string
) {
  const normalized =
    posix
      .normalize(
        value.replace(
          /\\/g,
          "/"
        )
      )
      .replace(
        /^\/+/,
        ""
      );

  if (
    !normalized ||
    normalized ===
      "." ||
    normalized.startsWith(
      "../"
    ) ||
    normalized.includes(
      "/../"
    )
  ) {
    throw new Error(
      "Invalid website path."
    );
  }

  return normalized;
}

function createWebsiteObjectKey(
  websiteId:
    string,
  path:
    string
) {
  return [
    "websites",
    websiteId,
    "files",
    path,
  ].join(
    "/"
  );
}

function chunkArray<T>(
  values:
    T[],
  size:
    number
) {
  const chunks:
    T[][] =
    [];

  for (
    let index =
      0;
    index <
    values.length;
    index +=
      size
  ) {
    chunks.push(
      values.slice(
        index,
        index +
          size
      )
    );
  }

  return chunks;
}

function formatBytes(
  bytes:
    number
) {
  if (
    !Number.isFinite(
      bytes
    ) ||
    bytes <=
      0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  let value =
    bytes;

  let unit =
    0;

  while (
    value >=
      1024 &&
    unit <
      units.length -
        1
  ) {
    value /=
      1024;

    unit +=
      1;
  }

  return `${value.toFixed(
    unit ===
    0
      ? 0
      : 1
  )} ${units[unit]}`;
}

function toError(
  error:
    unknown
) {
  return error instanceof
    Error
    ? error
    : new Error(
        String(
          error
        )
      );
}

function getContentType(
  path:
    string
) {
  const extension =
    path
      .split(".")
      .pop()
      ?.toLowerCase();

  switch (
    extension
  ) {
    case "html":
    case "htm":
      return "text/html; charset=utf-8";

    case "css":
      return "text/css; charset=utf-8";

    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "text/javascript; charset=utf-8";

    case "json":
      return "application/json; charset=utf-8";

    case "svg":
      return "image/svg+xml";

    case "png":
      return "image/png";

    case "jpg":
    case "jpeg":
      return "image/jpeg";

    case "webp":
      return "image/webp";

    case "gif":
      return "image/gif";

    case "zip":
      return "application/zip";

    case "md":
      return "text/markdown; charset=utf-8";

    case "txt":
    case "ts":
    case "tsx":
      return "text/plain; charset=utf-8";

    default:
      return "application/octet-stream";
  }
}