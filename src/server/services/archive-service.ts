import {
  posix,
} from "node:path";

import {
  unzipSync,
  zipSync,
} from "fflate";

import {
  findWebsiteFiles,
} from "@/server/repositories/file-repository";

import {
  deleteWebsiteFile,
  getWebsiteFile,
  uploadWebsiteFile,
} from "@/server/services/file-service";

import {
  getR2StorageProvider,
} from "@/server/providers/storage/r2-storage-provider";

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

const MAX_CREATE_ARCHIVE_BYTES =
  1024 *
  1024 *
  1024;

type ExtractWebsiteArchiveInput = {
  websiteId:
    string;

  archivePath:
    string;

  destinationPath?:
    string;

  overwrite?:
    boolean;

  deleteArchiveAfter?:
    boolean;
};

type CreateWebsiteArchiveInput = {
  websiteId:
    string;

  paths:
    string[];

  archivePath:
    string;

  overwrite?:
    boolean;
};

export type ExtractWebsiteArchiveResult = {
  extractedFiles:
    number;

  skippedFiles:
    number;

  overwrittenFiles:
    number;

  extractedBytes:
    number;

  folders:
    number;

  destinationPath:
    string;
};

export type CreateWebsiteArchiveResult = {
  archivePath:
    string;

  archivedFiles:
    number;

  sourceBytes:
    number;

  archiveBytes:
    number;
};

type ExtractedEntry = {
  path:
    string;

  body:
    Uint8Array;

  contentType:
    string;
};

export async function extractWebsiteArchive(
  input:
    ExtractWebsiteArchiveInput
): Promise<ExtractWebsiteArchiveResult> {
  const archivePath =
    normalizeWebsitePath(
      input.archivePath
    );

  if (
    !archivePath
      .toLowerCase()
      .endsWith(
        ".zip"
      )
  ) {
    throw new Error(
      "Only ZIP archives can be extracted right now."
    );
  }

  const destinationPath =
    normalizeDestinationPath(
      input.destinationPath
    );

  const overwrite =
    input.overwrite ??
    true;

  const archive =
    await getWebsiteFile(
      input.websiteId,
      archivePath
    );

  if (!archive) {
    throw new Error(
      "Archive file was not found."
    );
  }

  if (
    archive.body
      .byteLength >
    MAX_ARCHIVE_BYTES
  ) {
    throw new Error(
      "This ZIP archive is too large to extract with the current extraction engine."
    );
  }

  let unpacked:
    Record<
      string,
      Uint8Array
    >;

  try {
    unpacked =
      unzipSync(
        archive.body
      );
  } catch {
    throw new Error(
      "The ZIP archive is invalid or corrupted."
    );
  }

  const rawEntries =
    Object.entries(
      unpacked
    );

  if (
    rawEntries.length >
    MAX_FILES
  ) {
    throw new Error(
      `This archive contains more than ${MAX_FILES.toLocaleString()} files.`
    );
  }

  const existingFiles =
    await findWebsiteFiles(
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

  const entries:
    ExtractedEntry[] =
    [];

  const folders =
    new Set<string>();

  let extractedBytes =
    0;

  for (
    const [
      archiveEntryPath,
      body,
    ]
    of rawEntries
  ) {
    if (
      archiveEntryPath.endsWith(
        "/"
      )
    ) {
      continue;
    }

    const safeEntryPath =
      validateArchiveEntryPath(
        archiveEntryPath
      );

    const outputPath =
      destinationPath
        ? joinWebsitePath(
            destinationPath,
            safeEntryPath
          )
        : safeEntryPath;

    extractedBytes +=
      body.byteLength;

    if (
      extractedBytes >
      MAX_EXTRACTED_BYTES
    ) {
      throw new Error(
        "The extracted archive would exceed the allowed extraction size."
      );
    }

    if (
      body.byteLength >
      MAX_SINGLE_FILE_BYTES
    ) {
      throw new Error(
        `"${safeEntryPath}" exceeds the maximum extracted file size.`
      );
    }

    collectParentFolders(
      outputPath,
      folders
    );

    entries.push({
      path:
        outputPath,

      body,

      contentType:
        getContentType(
          outputPath
        ),
    });
  }

  let extractedFiles =
    0;

  let skippedFiles =
    0;

  let overwrittenFiles =
    0;

  await mapWithConcurrency(
    entries,
    6,
    async (
      entry
    ) => {
      const exists =
        existingPaths.has(
          entry.path
        );

      if (
        exists &&
        !overwrite
      ) {
        skippedFiles +=
          1;

        return;
      }

      await uploadWebsiteFile({
        websiteId:
          input.websiteId,

        path:
          entry.path,

        body:
          entry.body,

        contentType:
          entry.contentType,
      });

      if (exists) {
        overwrittenFiles +=
          1;
      }

      extractedFiles +=
        1;

      existingPaths.add(
        entry.path
      );
    }
  );

  if (
    input.deleteArchiveAfter
  ) {
    await deleteWebsiteFile(
      input.websiteId,
      archivePath
    );
  }

  return {
    extractedFiles,

    skippedFiles,

    overwrittenFiles,

    extractedBytes,

    folders:
      folders.size,

    destinationPath:
      destinationPath
        ? `/${destinationPath}`
        : "/",
  };
}

export async function createWebsiteArchive(
  input:
    CreateWebsiteArchiveInput
): Promise<CreateWebsiteArchiveResult> {
  const archivePath =
    normalizeWebsitePath(
      input.archivePath
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

  if (
    input.paths.length ===
    0
  ) {
    throw new Error(
      "Select at least one file or folder."
    );
  }

  const selectedPaths =
    Array.from(
      new Set(
        input.paths.map(
          normalizeWebsitePath
        )
      )
    );

  const records =
    await findWebsiteFiles(
      input.websiteId
    );

  const files =
    records.filter(
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
    files.length ===
    0
  ) {
    throw new Error(
      "No files were found for the selected items."
    );
  }

  if (
    files.length >
    MAX_FILES
  ) {
    throw new Error(
      `A ZIP can contain at most ${MAX_FILES.toLocaleString()} files right now.`
    );
  }

  const existingArchive =
    records.find(
      (
        file
      ) =>
        file.path ===
        archivePath
    );

  if (
    existingArchive &&
    !input.overwrite
  ) {
    throw new Error(
      "A file already exists at the archive destination."
    );
  }

  const storage =
    getR2StorageProvider();

  const archiveEntries:
    Record<
      string,
      Uint8Array
    > = {};

  let sourceBytes =
    0;

  await mapWithConcurrency(
    files,
    6,
    async (
      file
    ) => {
      const object =
        await storage.get(
          file.object_key
        );

      if (!object) {
        throw new Error(
          `"${file.path}" no longer exists in storage.`
        );
      }

      sourceBytes +=
        object.body
          .byteLength;

      if (
        sourceBytes >
        MAX_CREATE_ARCHIVE_BYTES
      ) {
        throw new Error(
          "The selected files are too large to compress with the current archive engine."
        );
      }

      const archiveEntryPath =
        getArchiveEntryPath(
          file.path,
          selectedPaths
        );

      archiveEntries[
        archiveEntryPath
      ] =
        object.body;
    }
  );

  let zip:
    Uint8Array;

  try {
    zip =
      zipSync(
        archiveEntries,
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

  await uploadWebsiteFile({
    websiteId:
      input.websiteId,

    path:
      archivePath,

    body:
      zip,

    contentType:
      "application/zip",
  });

  return {
    archivePath:
      `/${archivePath}`,

    archivedFiles:
      files.length,

    sourceBytes,

    archiveBytes:
      zip.byteLength,
  };
}

function getArchiveEntryPath(
  filePath:
    string,
  selectedPaths:
    string[]
) {
  const matchingSelection =
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
          a,
          b
        ) =>
          b.length -
          a.length
      )[0];

  if (
    !matchingSelection
  ) {
    return filePath;
  }

  const selectionName =
    matchingSelection
      .split("/")
      .filter(
        Boolean
      )
      .pop();

  if (
    filePath ===
    matchingSelection
  ) {
    return (
      selectionName ??
      filePath
    );
  }

  const relative =
    filePath.slice(
      matchingSelection
        .length +
        1
    );

  return selectionName
    ? `${selectionName}/${relative}`
    : relative;
}

function validateArchiveEntryPath(
  value: string
) {
  if (
    value.includes(
      "\0"
    )
  ) {
    throw new Error(
      "Archive contains an invalid file path."
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
      `Archive contains an absolute path: "${value}".`
    );
  }

  const segments =
    normalized
      .split("/")
      .filter(
        Boolean
      );

  if (
    segments.some(
      (
        segment
      ) =>
        segment ===
          "." ||
        segment ===
          ".."
    )
  ) {
    throw new Error(
      `Archive contains an unsafe path: "${value}".`
    );
  }

  if (
    segments.length ===
    0
  ) {
    throw new Error(
      "Archive contains an invalid empty path."
    );
  }

  if (
    segments.length >
    MAX_DEPTH
  ) {
    throw new Error(
      `Archive path "${value}" is nested too deeply.`
    );
  }

  const safePath =
    segments.join(
      "/"
    );

  if (
    safePath.length >
    MAX_PATH_LENGTH
  ) {
    throw new Error(
      "Archive contains a path that is too long."
    );
  }

  return safePath;
}

function normalizeDestinationPath(
  value?: string
) {
  if (
    !value ||
    value.trim() ===
      "/" ||
    !value.trim()
  ) {
    return "";
  }

  return normalizeWebsitePath(
    value
  );
}

function normalizeWebsitePath(
  value: string
) {
  const normalized =
    posix
      .normalize(
        value
          .replace(
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

function joinWebsitePath(
  parent: string,
  child: string
) {
  return normalizeWebsitePath(
    `${parent}/${child}`
  );
}

function collectParentFolders(
  filePath: string,
  folders:
    Set<string>
) {
  const parts =
    filePath
      .split("/")
      .filter(
        Boolean
      );

  parts.pop();

  let current =
    "";

  for (
    const part
    of parts
  ) {
    current =
      current
        ? `${current}/${part}`
        : part;

    folders.add(
      current
    );
  }
}

function getContentType(
  path: string
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

    case "md":
      return "text/markdown; charset=utf-8";

    case "txt":
    case "ts":
    case "tsx":
      return "text/plain; charset=utf-8";

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

    default:
      return "application/octet-stream";
  }
}

async function mapWithConcurrency<
  T,
>(
  values:
    T[],
  concurrency:
    number,
  worker: (
    value:
      T
  ) => Promise<void>
) {
  let nextIndex =
    0;

  async function runWorker() {
    while (
      nextIndex <
      values.length
    ) {
      const index =
        nextIndex;

      nextIndex +=
        1;

      await worker(
        values[
          index
        ]
      );
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            concurrency,
            values.length
          ),
      },
      () =>
        runWorker()
    )
  );
}