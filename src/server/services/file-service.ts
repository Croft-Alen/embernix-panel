import {
  createHash,
} from "node:crypto";

import {
  basename,
  posix,
} from "node:path";

import {
  getR2StorageProvider,
} from "@/server/providers/storage/r2-storage-provider";

import {
  deleteWebsiteFileMetadata,
  findWebsiteFileByPath,
  findWebsiteFiles,
  getWebsiteStorageUsage,
  upsertWebsiteFile,
} from "@/server/repositories/file-repository";

import {
  getWebsite,
} from "@/server/services/website-service";

type UploadWebsiteFileInput = {
  websiteId: string;

  path: string;

  body:
    | Uint8Array
    | Buffer
    | string;

  contentType?: string;
};

type PrepareWebsiteFileUploadInput = {
  path: string;

  sizeBytes: number;

  contentType?: string;
};

type FinalizeWebsiteFileUploadInput = {
  path: string;
};

export async function listWebsiteFiles(
  websiteId: string
) {
  await requireExistingWebsite(
    websiteId
  );

  await reconcileWebsiteFiles(
    websiteId
  );

  return findWebsiteFiles(
    websiteId
  );
}

export async function getWebsiteFile(
  websiteId: string,
  path: string
) {
  await requireExistingWebsite(
    websiteId
  );

  const normalizedPath =
    normalizeWebsitePath(
      path
    );

  const metadata =
    await findWebsiteFileByPath(
      websiteId,
      normalizedPath
    );

  if (!metadata) {
    return null;
  }

  const storage =
    getR2StorageProvider();

  const object =
    await storage.get(
      metadata.object_key
    );

  if (!object) {
    await deleteWebsiteFileMetadata(
      websiteId,
      normalizedPath
    );

    return null;
  }

  return {
    metadata,

    body:
      object.body,
  };
}

export async function createWebsiteFileDownload(
  websiteId: string,
  path: string
) {
  await requireExistingWebsite(
    websiteId
  );

  const normalizedPath =
    normalizeWebsitePath(
      path
    );

  const file =
    await findWebsiteFileByPath(
      websiteId,
      normalizedPath
    );

  if (!file) {
    throw new Error(
      "File not found."
    );
  }

  const storage =
    getR2StorageProvider();

  const object =
    await storage.head(
      file.object_key
    );

  if (!object) {
    await deleteWebsiteFileMetadata(
      websiteId,
      normalizedPath
    );

    throw new Error(
      "File no longer exists in storage."
    );
  }

  const signed =
    await storage.createPresignedGetUrl({
      key:
        file.object_key,

      expiresInSeconds:
        300,

      downloadFileName:
        file.file_name,
    });

  return {
    url:
      signed.url,

    fileName:
      file.file_name,

    sizeBytes:
      object.contentLength,
  };
}

export async function uploadWebsiteFile(
  input: UploadWebsiteFileInput
) {
  await requireExistingWebsite(
    input.websiteId
  );

  const path =
    normalizeWebsitePath(
      input.path
    );

  const body =
    normalizeBody(
      input.body
    );

  const objectKey =
    createWebsiteObjectKey(
      input.websiteId,
      path
    );

  const checksumSha256 =
    createHash(
      "sha256"
    )
      .update(
        body
      )
      .digest(
        "hex"
      );

  const storage =
    getR2StorageProvider();

  const uploaded =
    await storage.put({
      key:
        objectKey,

      body,

      contentType:
        input.contentType,

      metadata: {
        website_id:
          input.websiteId,

        website_path:
          path,

        checksum_sha256:
          checksumSha256,
      },
    });

  try {
    return await upsertWebsiteFile({
      websiteId:
        input.websiteId,

      path,

      objectKey:
        uploaded.key,

      fileName:
        basename(
          path
        ),

      contentType:
        input.contentType,

      sizeBytes:
        body.byteLength,

      etag:
        uploaded.etag ??
        undefined,

      checksumSha256,
    });
  } catch (
    error
  ) {
    try {
      await storage.delete(
        uploaded.key
      );
    } catch {
    }

    throw error;
  }
}

export async function prepareWebsiteFileUploads(
  websiteId: string,
  inputs:
    PrepareWebsiteFileUploadInput[]
) {
  await requireExistingWebsite(
    websiteId
  );

  if (
    inputs.length ===
    0
  ) {
    return [];
  }

  if (
    inputs.length >
    100
  ) {
    throw new Error(
      "A maximum of 100 files can be prepared at once."
    );
  }

  const storage =
    getR2StorageProvider();

  return Promise.all(
    inputs.map(
      async (
        input
      ) => {
        if (
          !Number.isSafeInteger(
            input.sizeBytes
          ) ||
          input.sizeBytes <
            0
        ) {
          throw new Error(
            "Invalid file size."
          );
        }

        const path =
          normalizeWebsitePath(
            input.path
          );

        const objectKey =
          createWebsiteObjectKey(
            websiteId,
            path
          );

        const contentType =
          input.contentType ||
          "application/octet-stream";

        const signed =
          await storage.createPresignedPutUrl({
            key:
              objectKey,

            contentType,

            expiresInSeconds:
              600,
          });

        return {
          path,

          objectKey:
            signed.key,

          uploadUrl:
            signed.url,

          contentType,

          sizeBytes:
            input.sizeBytes,
        };
      }
    )
  );
}

export async function finalizeWebsiteFileUploads(
  websiteId: string,
  inputs:
    FinalizeWebsiteFileUploadInput[]
) {
  await requireExistingWebsite(
    websiteId
  );

  if (
    inputs.length ===
    0
  ) {
    return [];
  }

  if (
    inputs.length >
    100
  ) {
    throw new Error(
      "A maximum of 100 files can be finalized at once."
    );
  }

  const storage =
    getR2StorageProvider();

  return mapWithConcurrency(
    inputs,
    10,
    async (
      input
    ) => {
      const path =
        normalizeWebsitePath(
          input.path
        );

      const objectKey =
        createWebsiteObjectKey(
          websiteId,
          path
        );

      const object =
        await storage.head(
          objectKey
        );

      if (!object) {
        throw new Error(
          `Uploaded object "${path}" was not found in storage.`
        );
      }

      return upsertWebsiteFile({
        websiteId,

        path,

        objectKey,

        fileName:
          basename(
            path
          ),

        contentType:
          object.contentType ??
          undefined,

        sizeBytes:
          object.contentLength,

        etag:
          object.etag ??
          undefined,

        checksumSha256:
          object.metadata
            .checksum_sha256,
      });
    }
  );
}

export async function deleteWebsiteFile(
  websiteId: string,
  path: string
) {
  await deleteWebsiteItems(
    websiteId,
    [
      path,
    ]
  );
}

export async function deleteWebsiteItems(
  websiteId: string,
  paths: string[]
) {
  await requireExistingWebsite(
    websiteId
  );

  if (
    paths.length ===
    0
  ) {
    return {
      deletedFiles:
        0,
    };
  }

  const normalizedPaths =
    Array.from(
      new Set(
        paths.map(
          normalizeWebsitePath
        )
      )
    );

  const files =
    await findWebsiteFiles(
      websiteId
    );

  const filesToDelete =
    files.filter(
      (
        file
      ) =>
        normalizedPaths.some(
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
    filesToDelete.length ===
    0
  ) {
    return {
      deletedFiles:
        0,
    };
  }

  const storage =
    getR2StorageProvider();

  await mapWithConcurrency(
    filesToDelete,
    8,
    async (
      file
    ) => {
      await storage.delete(
        file.object_key
      );

      await deleteWebsiteFileMetadata(
        websiteId,
        file.path
      );
    }
  );

  return {
    deletedFiles:
      filesToDelete.length,
  };
}

export async function getWebsiteFileUsage(
  websiteId: string
) {
  await requireExistingWebsite(
    websiteId
  );

  await reconcileWebsiteFiles(
    websiteId
  );

  return getWebsiteStorageUsage(
    websiteId
  );
}

export async function reconcileWebsiteFiles(
  websiteId: string
) {
  await requireExistingWebsite(
    websiteId
  );

  const storage =
    getR2StorageProvider();

  const prefix =
    createWebsiteFilesPrefix(
      websiteId
    );

  const storageObjects =
    await listAllStorageObjects(
      prefix
    );

  const databaseFiles =
    await findWebsiteFiles(
      websiteId
    );

  const storageByKey =
    new Map(
      storageObjects.map(
        (
          object
        ) => [
          object.key,
          object,
        ]
      )
    );

  const databaseByKey =
    new Map(
      databaseFiles.map(
        (
          file
        ) => [
          file.object_key,
          file,
        ]
      )
    );

  const staleFiles =
    databaseFiles.filter(
      (
        file
      ) =>
        !storageByKey.has(
          file.object_key
        )
    );

  await mapWithConcurrency(
    staleFiles,
    10,
    async (
      file
    ) => {
      await deleteWebsiteFileMetadata(
        websiteId,
        file.path
      );
    }
  );

  const objectsToSync =
    storageObjects.filter(
      (
        object
      ) => {
        const existing =
          databaseByKey.get(
            object.key
          );

        if (!existing) {
          return true;
        }

        return (
          Number(
            existing.size_bytes
          ) !==
            object.size ||
          normalizeEtag(
            existing.etag
          ) !==
            normalizeEtag(
              object.etag
            )
        );
      }
    );

  await mapWithConcurrency(
    objectsToSync,
    10,
    async (
      object
    ) => {
      const path =
        storageKeyToWebsitePath(
          websiteId,
          object.key
        );

      if (!path) {
        return;
      }

      const head =
        await storage.head(
          object.key
        );

      if (!head) {
        return;
      }

      const existing =
        databaseByKey.get(
          object.key
        );

      await upsertWebsiteFile({
        websiteId,

        path,

        objectKey:
          object.key,

        fileName:
          basename(
            path
          ),

        contentType:
          head.contentType ??
          undefined,

        sizeBytes:
          head.contentLength,

        etag:
          head.etag ??
          undefined,

        checksumSha256:
          head.metadata
            .checksum_sha256 ??
          existing
            ?.checksum_sha256 ??
          undefined,
      });
    }
  );
}

function createWebsiteFilesPrefix(
  websiteId: string
) {
  return [
    "websites",
    websiteId,
    "files",
    "",
  ].join(
    "/"
  );
}

function createWebsiteObjectKey(
  websiteId: string,
  path: string
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

function storageKeyToWebsitePath(
  websiteId: string,
  key: string
) {
  const prefix =
    createWebsiteFilesPrefix(
      websiteId
    );

  if (
    !key.startsWith(
      prefix
    )
  ) {
    return null;
  }

  const path =
    key.slice(
      prefix.length
    );

  if (
    !path ||
    path.endsWith(
      "/"
    )
  ) {
    return null;
  }

  return normalizeWebsitePath(
    path
  );
}

async function listAllStorageObjects(
  prefix: string
) {
  const storage =
    getR2StorageProvider();

  const objects:
    Awaited<
      ReturnType<
        typeof storage.list
      >
    >["objects"] = [];

  let cursor:
    string | undefined;

  while (true) {
    const result =
      await storage.list({
        prefix,

        cursor,

        limit:
          1000,
      });

    objects.push(
      ...result.objects
    );

    if (
      !result.hasMore ||
      !result.cursor
    ) {
      break;
    }

    cursor =
      result.cursor;
  }

  return objects;
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
      "Invalid website file path."
    );
  }

  return normalized;
}

function normalizeBody(
  body:
    | Uint8Array
    | Buffer
    | string
) {
  if (
    typeof body ===
    "string"
  ) {
    return Buffer.from(
      body,
      "utf8"
    );
  }

  return Buffer.from(
    body
  );
}

function normalizeEtag(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return null;
  }

  return value.replace(
    /^"|"$/g,
    ""
  );
}

async function requireExistingWebsite(
  websiteId: string
) {
  const website =
    await getWebsite(
      websiteId
    );

  if (!website) {
    throw new Error(
      "Website not found."
    );
  }

  return website;
}

async function mapWithConcurrency<
  T,
  R,
>(
  values: T[],
  concurrency: number,
  worker: (
    value: T
  ) => Promise<R>
): Promise<R[]> {
  if (
    values.length ===
    0
  ) {
    return [];
  }

  const results:
    R[] =
    new Array(
      values.length
    );

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

      results[
        index
      ] =
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

  return results;
}