import {
  Unzip,
  UnzipInflate,
} from "fflate";

import type {
  Env,
} from "../types";

import {
  deleteWebsiteFileMetadata,
  findWebsiteFileByPath,
  findWebsiteFiles,
  isFileOperationCancelRequested,
  requireWebsite,
  updateFileOperationProgress,
  upsertWebsiteFiles,
} from "../supabase";

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
  12;

const METADATA_BATCH_SIZE =
  100;

const PROGRESS_INTERVAL_MS =
  500;

const CANCEL_CHECK_INTERVAL_MS =
  1500;

export type ExtractZipPayload = {
  archivePath:
    string;

  destinationPath?:
    string;

  overwrite?:
    boolean;

  deleteArchiveAfter?:
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
  env: Env,
  input: {
    operationId:
      string;

    websiteId:
      string;

    payload:
      ExtractZipPayload;
  }
) {
  await requireWebsite(
    env,
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
    input.payload
      .overwrite ??
    true;

  await updateFileOperationProgress(
    env,
    input.operationId,
    {
      current:
        0,

      total:
        0,

      percent:
        1,

      message:
        "Connecting to archive",
    }
  );

  const archiveMetadata =
    await findWebsiteFileByPath(
      env,
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

  const archiveObject =
    await env
      .FILES_BUCKET
      .get(
        archiveMetadata
          .object_key
      );

  if (
    !archiveObject
  ) {
    throw new Error(
      "Archive object was not found in storage."
    );
  }

  const archiveSize =
    Number(
      archiveObject.size
    );

  if (
    archiveSize >
    MAX_ARCHIVE_BYTES
  ) {
    throw new Error(
      "ZIP archive exceeds the current extraction limit."
    );
  }

  const existingFiles =
    await findWebsiteFiles(
      env,
      input.websiteId
    );

  const existingPaths =
    new Set(
      existingFiles.map(
        (file) =>
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

  const uploadPromises =
    new Set<
      Promise<void>
    >();

  const metadataRows:
    UploadedEntry[] =
    [];

  const progress =
    createProgressReporter(
      async (
        progressInput
      ) => {
        await updateFileOperationProgress(
          env,
          input.operationId,
          progressInput
        );
      }
    );

  const isCanceled =
    createThrottledCancelCheck(
      async () =>
        isFileOperationCancelRequested(
          env,
          input.operationId
        )
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
              uploadExtractedFile(
                env,
                {
                  websiteId:
                    input.websiteId,

                  outputPath,

                  body,

                  alreadyExists,
                }
              )
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
                      result
                        .alreadyExists
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

  const reader =
    archiveObject
      .body
      .getReader();

  try {
    while (true) {
      if (
        fatalError
      ) {
        throw fatalError;
      }

      if (
        await isCanceled()
      ) {
        await reader.cancel();

        return {
          canceled:
            true,

          extractedFiles,

          overwrittenFiles,

          skippedFiles,
        };
      }

      const {
        done,
        value,
      } =
        await reader.read();

      if (
        done
      ) {
        break;
      }

      if (
        !value
      ) {
        continue;
      }

      bytesRead +=
        value.byteLength;

      unzip.push(
        value,
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
        archiveSize >
        0
          ? Math.min(
              1,
              bytesRead /
                archiveSize
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
          uploadedFiles,

        total:
          discoveredFiles,

        percent,

        message:
          `Reading ${formatBytes(
            bytesRead
          )} / ${formatBytes(
            archiveSize
          )} • ${uploadedFiles.toLocaleString()} files uploaded`,
      });
    }

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
      await isFileOperationCancelRequested(
        env,
        input.operationId
      )
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
      await upsertWebsiteFiles(
        env,
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

      await env
        .FILES_BUCKET
        .delete(
          archiveMetadata
            .object_key
        );

      await deleteWebsiteFileMetadata(
        env,
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
        true,
    };
  } finally {
    reader.releaseLock();
  }
}

async function uploadExtractedFile(
  env: Env,
  input: {
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
      input.websiteId,
      input.outputPath
    );

  const checksum =
    await sha256Hex(
      input.body
    );

  const contentType =
    getContentType(
      input.outputPath
    );

  const saved =
    await env
      .FILES_BUCKET
      .put(
        objectKey,
        input.body,
        {
          httpMetadata: {
            contentType,
          },

          customMetadata: {
            website_id:
              input.websiteId,

            website_path:
              input.outputPath,

            checksum_sha256:
              checksum,
          },
        }
      );

  return {
    alreadyExists:
      input.alreadyExists,

    metadata: {
      websiteId:
        input.websiteId,

      path:
        input.outputPath,

      objectKey,

      contentType,

      sizeBytes:
        input.body
          .byteLength,

      etag:
        saved.etag,

      checksumSha256:
        checksum,
    },
  };
}

async function sha256Hex(
  input:
    Uint8Array
) {
  const bytes =
    new Uint8Array(
      input.byteLength
    );

  bytes.set(
    input
  );

  const digest =
    await crypto
      .subtle
      .digest(
        "SHA-256",
        bytes.buffer
      );

  return Array.from(
    new Uint8Array(
      digest
    )
  )
    .map(
      (value) =>
        value
          .toString(16)
          .padStart(
            2,
            "0"
          )
    )
    .join("");
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
      .filter(Boolean);

  if (
    parts.some(
      (part) =>
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
    value
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /^\/+/,
        ""
      )
      .replace(
        /\/+/g,
        "/"
      );

  const parts =
    normalized
      .split("/")
      .filter(
        Boolean
      );

  if (
    parts.length ===
      0 ||
    parts.some(
      (part) =>
        part ===
          "." ||
        part ===
          ".."
    )
  ) {
    throw new Error(
      "Invalid website path."
    );
  }

  return parts.join(
    "/"
  );
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

function createProgressReporter(
  callback:
    (
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
    ) => Promise<void>
) {
  let lastUpdate =
    0;

  return {
    async report(
      value:
        Parameters<
          typeof callback
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
          typeof callback
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
    () =>
      Promise<boolean>
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