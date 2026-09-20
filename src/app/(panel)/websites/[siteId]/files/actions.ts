"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireUser,
} from "@/server/auth/require-user";

import {
  createWebsiteArchive,
  extractWebsiteArchive,
} from "@/server/services/archive-service";

import {
  createWebsiteFileDownload,
  deleteWebsiteFile,
  deleteWebsiteItems,
  finalizeWebsiteFileUploads,
  getWebsiteFile,
  getWebsiteFileUsage,
  listWebsiteFiles,
  prepareWebsiteFileUploads,
  uploadWebsiteFile,
} from "@/server/services/file-service";

import {
  copyWebsiteItem,
  copyWebsiteItems,
  moveWebsiteItem,
  moveWebsiteItems,
  renameWebsiteItem,
} from "@/server/services/file-operation-service";

type FileActionResult = {
  id: string;
  path: string;
  fileName: string;
  sizeBytes: number;
  contentType:
    | string
    | null;
  updatedAt: string;
};

type PrepareUploadInput = {
  path: string;
  sizeBytes: number;
  contentType?: string;
};

export async function prepareWebsiteFileUploadsAction(
  websiteId: string,
  files:
    PrepareUploadInput[]
) {
  await requireUser();

  return prepareWebsiteFileUploads(
    websiteId,
    files.map(
      (
        file
      ) => ({
        path:
          file.path,

        sizeBytes:
          file.sizeBytes,

        contentType:
          file.contentType ||
          getContentType(
            file.path
          ),
      })
    )
  );
}

export async function finalizeWebsiteFileUploadsAction(
  websiteId: string,
  paths: string[]
): Promise<
  FileActionResult[]
> {
  await requireUser();

  const files =
    await finalizeWebsiteFileUploads(
      websiteId,
      paths.map(
        (
          path
        ) => ({
          path,
        })
      )
    );

  revalidateFiles(
    websiteId
  );

  return files.map(
    toFileResult
  );
}

export async function createWebsiteFileAction(
  websiteId: string,
  path: string
): Promise<FileActionResult> {
  await requireUser();

  const saved =
    await uploadWebsiteFile({
      websiteId,
      path,
      body: "",
      contentType:
        getContentType(
          path
        ),
    });

  revalidateFiles(
    websiteId
  );

  return toFileResult(
    saved
  );
}

export async function getWebsiteFileContentAction(
  websiteId: string,
  path: string
) {
  await requireUser();

  const file =
    await getWebsiteFile(
      websiteId,
      path
    );

  if (!file) {
    throw new Error(
      "File not found."
    );
  }

  if (
    file.metadata
      .size_bytes >
    2 *
      1024 *
      1024
  ) {
    throw new Error(
      "Files larger than 2 MB cannot be opened in the code editor yet."
    );
  }

  return {
    content:
      new TextDecoder(
        "utf-8"
      ).decode(
        file.body
      ),

    contentType:
      file.metadata
        .content_type,
  };
}

export async function saveWebsiteFileContentAction(
  websiteId: string,
  path: string,
  content: string
): Promise<FileActionResult> {
  await requireUser();

  const saved =
    await uploadWebsiteFile({
      websiteId,
      path,
      body:
        content,
      contentType:
        getContentType(
          path
        ),
    });

  revalidateFiles(
    websiteId
  );

  return toFileResult(
    saved
  );
}

export async function createWebsiteFileDownloadAction(
  websiteId: string,
  path: string
) {
  await requireUser();

  return createWebsiteFileDownload(
    websiteId,
    path
  );
}

export async function createWebsiteArchiveAction(
  websiteId: string,
  input: {
    paths:
      string[];

    archivePath:
      string;

    overwrite:
      boolean;
  }
) {
  await requireUser();

  const result =
    await createWebsiteArchive({
      websiteId,

      paths:
        input.paths,

      archivePath:
        input.archivePath,

      overwrite:
        input.overwrite,
    });

  revalidateFiles(
    websiteId
  );

  return result;
}

export async function extractWebsiteArchiveAction(
  websiteId: string,
  input: {
    archivePath:
      string;

    destinationPath:
      string;

    overwrite:
      boolean;

    deleteArchiveAfter:
      boolean;
  }
) {
  await requireUser();

  const result =
    await extractWebsiteArchive({
      websiteId,

      archivePath:
        input.archivePath,

      destinationPath:
        input.destinationPath,

      overwrite:
        input.overwrite,

      deleteArchiveAfter:
        input.deleteArchiveAfter,
    });

  revalidateFiles(
    websiteId
  );

  return result;
}

export async function renameWebsiteItemAction(
  websiteId: string,
  input: {
    sourcePath:
      string;

    newName:
      string;

    overwrite:
      boolean;
  }
) {
  await requireUser();

  const result =
    await renameWebsiteItem({
      websiteId,

      sourcePath:
        input.sourcePath,

      newName:
        input.newName,

      overwrite:
        input.overwrite,
    });

  revalidateFiles(
    websiteId
  );

  return result;
}

export async function moveWebsiteItemAction(
  websiteId: string,
  input: {
    sourcePath:
      string;

    destinationPath:
      string;

    overwrite:
      boolean;
  }
) {
  await requireUser();

  const result =
    await moveWebsiteItem({
      websiteId,

      sourcePath:
        input.sourcePath,

      destinationPath:
        input.destinationPath,

      overwrite:
        input.overwrite,
    });

  revalidateFiles(
    websiteId
  );

  return result;
}

export async function copyWebsiteItemAction(
  websiteId: string,
  input: {
    sourcePath:
      string;

    destinationPath:
      string;

    overwrite:
      boolean;
  }
) {
  await requireUser();

  const result =
    await copyWebsiteItem({
      websiteId,

      sourcePath:
        input.sourcePath,

      destinationPath:
        input.destinationPath,

      overwrite:
        input.overwrite,
    });

  revalidateFiles(
    websiteId
  );

  return result;
}

export async function moveWebsiteItemsAction(
  websiteId: string,
  input: {
    sourcePaths:
      string[];

    destinationDirectory:
      string;

    overwrite:
      boolean;
  }
) {
  await requireUser();

  const result =
    await moveWebsiteItems({
      websiteId,

      sourcePaths:
        input.sourcePaths,

      destinationDirectory:
        input.destinationDirectory,

      overwrite:
        input.overwrite,
    });

  revalidateFiles(
    websiteId
  );

  return result;
}

export async function copyWebsiteItemsAction(
  websiteId: string,
  input: {
    sourcePaths:
      string[];

    destinationDirectory:
      string;

    overwrite:
      boolean;
  }
) {
  await requireUser();

  const result =
    await copyWebsiteItems({
      websiteId,

      sourcePaths:
        input.sourcePaths,

      destinationDirectory:
        input.destinationDirectory,

      overwrite:
        input.overwrite,
    });

  revalidateFiles(
    websiteId
  );

  return result;
}

export async function deleteWebsiteFileAction(
  websiteId: string,
  path: string
) {
  await requireUser();

  await deleteWebsiteFile(
    websiteId,
    path
  );

  revalidateFiles(
    websiteId
  );

  return {
    success:
      true,
  };
}

export async function deleteWebsiteItemsAction(
  websiteId: string,
  paths:
    string[]
) {
  await requireUser();

  const result =
    await deleteWebsiteItems(
      websiteId,
      paths
    );

  revalidateFiles(
    websiteId
  );

  return {
    success:
      true,

    deletedFiles:
      result.deletedFiles,
  };
}

export async function listWebsiteFilesAction(
  websiteId: string
) {
  await requireUser();

  return listWebsiteFiles(
    websiteId
  );
}

export async function getWebsiteFileUsageAction(
  websiteId: string
) {
  await requireUser();

  return {
    usedBytes:
      await getWebsiteFileUsage(
        websiteId
      ),
  };
}

function toFileResult(
  file: {
    id: string;
    path: string;
    file_name: string;
    size_bytes: number;
    content_type:
      | string
      | null;
    updated_at: string;
  }
): FileActionResult {
  return {
    id:
      file.id,

    path:
      file.path,

    fileName:
      file.file_name,

    sizeBytes:
      Number(
        file.size_bytes
      ),

    contentType:
      file.content_type,

    updatedAt:
      file.updated_at,
  };
}

function revalidateFiles(
  websiteId: string
) {
  revalidatePath(
    "/websites"
  );

  revalidatePath(
    `/websites/${websiteId}`
  );

  revalidatePath(
    `/websites/${websiteId}/files`
  );
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

    case "ts":
    case "tsx":
      return "text/plain; charset=utf-8";

    case "json":
      return "application/json; charset=utf-8";

    case "md":
      return "text/markdown; charset=utf-8";

    case "txt":
      return "text/plain; charset=utf-8";

    case "xml":
      return "application/xml; charset=utf-8";

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

    case "ico":
      return "image/x-icon";

    case "pdf":
      return "application/pdf";

    case "zip":
      return "application/zip";

    case "woff":
      return "font/woff";

    case "woff2":
      return "font/woff2";

    case "ttf":
      return "font/ttf";

    case "mp4":
      return "video/mp4";

    case "webm":
      return "video/webm";

    case "mp3":
      return "audio/mpeg";

    case "wav":
      return "audio/wav";

    default:
      return "application/octet-stream";
  }
}
