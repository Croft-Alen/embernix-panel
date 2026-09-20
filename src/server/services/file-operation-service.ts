import {
  basename,
  posix,
} from "node:path";

import {
  getR2StorageProvider,
} from "@/server/providers/storage/r2-storage-provider";

import {
  deleteWebsiteFileMetadata,
  findWebsiteFiles,
  upsertWebsiteFile,
} from "@/server/repositories/file-repository";

import {
  getWebsite,
} from "@/server/services/website-service";

type MoveWebsiteItemInput = {
  websiteId: string;
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
};

type CopyWebsiteItemInput = {
  websiteId: string;
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
};

type RenameWebsiteItemInput = {
  websiteId: string;
  sourcePath: string;
  newName: string;
  overwrite?: boolean;
};

type BulkWebsiteItemInput = {
  websiteId: string;
  sourcePaths: string[];
  destinationDirectory: string;
  overwrite?: boolean;
};

type OperationMode =
  | "move"
  | "copy";

type PlannedFileOperation = {
  sourcePath: string;
  destinationPath: string;
  sourceObjectKey: string;
  destinationObjectKey: string;
  contentType:
    | string
    | null;
  checksumSha256:
    | string
    | null;
};

export type WebsiteItemOperationResult = {
  sourcePath: string;
  destinationPath: string;
  affectedFiles: number;
};

export type WebsiteBulkItemOperationResult = {
  sourcePaths: string[];
  destinationDirectory: string;
  affectedItems: number;
  affectedFiles: number;
};

export async function renameWebsiteItem(
  input:
    RenameWebsiteItemInput
): Promise<WebsiteItemOperationResult> {
  await requireExistingWebsite(
    input.websiteId
  );

  const sourcePath =
    normalizeWebsitePath(
      input.sourcePath
    );

  const newName =
    normalizeItemName(
      input.newName
    );

  const parentPath =
    getParentPath(
      sourcePath
    );

  const destinationPath =
    parentPath
      ? `${parentPath}/${newName}`
      : newName;

  if (
    sourcePath ===
    destinationPath
  ) {
    return {
      sourcePath:
        `/${sourcePath}`,

      destinationPath:
        `/${destinationPath}`,

      affectedFiles:
        0,
    };
  }

  return moveWebsiteItem({
    websiteId:
      input.websiteId,

    sourcePath,

    destinationPath,

    overwrite:
      input.overwrite,
  });
}

export async function moveWebsiteItem(
  input:
    MoveWebsiteItemInput
): Promise<WebsiteItemOperationResult> {
  const result =
    await operateWebsiteItems({
      websiteId:
        input.websiteId,

      sourcePaths: [
        input.sourcePath,
      ],

      destinationPaths: [
        input.destinationPath,
      ],

      overwrite:
        input.overwrite ??
        false,

      mode:
        "move",
    });

  return {
    sourcePath:
      result.sourcePaths[0],

    destinationPath:
      result.destinationPaths[0],

    affectedFiles:
      result.affectedFiles,
  };
}

export async function copyWebsiteItem(
  input:
    CopyWebsiteItemInput
): Promise<WebsiteItemOperationResult> {
  const result =
    await operateWebsiteItems({
      websiteId:
        input.websiteId,

      sourcePaths: [
        input.sourcePath,
      ],

      destinationPaths: [
        input.destinationPath,
      ],

      overwrite:
        input.overwrite ??
        false,

      mode:
        "copy",
    });

  return {
    sourcePath:
      result.sourcePaths[0],

    destinationPath:
      result.destinationPaths[0],

    affectedFiles:
      result.affectedFiles,
  };
}

export async function moveWebsiteItems(
  input:
    BulkWebsiteItemInput
): Promise<WebsiteBulkItemOperationResult> {
  return operateWebsiteItemsIntoDirectory({
    ...input,
    mode:
      "move",
  });
}

export async function copyWebsiteItems(
  input:
    BulkWebsiteItemInput
): Promise<WebsiteBulkItemOperationResult> {
  return operateWebsiteItemsIntoDirectory({
    ...input,
    mode:
      "copy",
  });
}

async function operateWebsiteItemsIntoDirectory(
  input:
    BulkWebsiteItemInput & {
      mode:
        OperationMode;
    }
): Promise<WebsiteBulkItemOperationResult> {
  await requireExistingWebsite(
    input.websiteId
  );

  const sourcePaths =
    collapseNestedPaths(
      input.sourcePaths.map(
        normalizeWebsitePath
      )
    );

  if (
    sourcePaths.length ===
    0
  ) {
    throw new Error(
      "Select at least one file or folder."
    );
  }

  const destinationDirectory =
    normalizeWebsiteDirectory(
      input.destinationDirectory
    );

  const destinationPaths =
    sourcePaths.map(
      (
        sourcePath
      ) => {
        const name =
          getBaseName(
            sourcePath
          );

        return destinationDirectory
          ? `${destinationDirectory}/${name}`
          : name;
      }
    );

  const uniqueDestinations =
    new Set(
      destinationPaths
    );

  if (
    uniqueDestinations.size !==
    destinationPaths.length
  ) {
    throw new Error(
      "Two selected items would have the same destination name."
    );
  }

  const result =
    await operateWebsiteItems({
      websiteId:
        input.websiteId,

      sourcePaths,

      destinationPaths,

      overwrite:
        input.overwrite ??
        false,

      mode:
        input.mode,
    });

  return {
    sourcePaths:
      result.sourcePaths,

    destinationDirectory:
      destinationDirectory
        ? `/${destinationDirectory}`
        : "/",

    affectedItems:
      sourcePaths.length,

    affectedFiles:
      result.affectedFiles,
  };
}

async function operateWebsiteItems({
  websiteId,
  sourcePaths,
  destinationPaths,
  overwrite,
  mode,
}: {
  websiteId: string;
  sourcePaths: string[];
  destinationPaths: string[];
  overwrite: boolean;
  mode: OperationMode;
}) {
  await requireExistingWebsite(
    websiteId
  );

  if (
    sourcePaths.length !==
    destinationPaths.length
  ) {
    throw new Error(
      "Invalid file operation request."
    );
  }

  const normalizedSources =
    collapseNestedPaths(
      sourcePaths.map(
        normalizeWebsitePath
      )
    );

  if (
    normalizedSources.length !==
    sourcePaths.length
  ) {
    throw new Error(
      "Nested duplicate selections are not allowed for this operation."
    );
  }

  const normalizedDestinations =
    destinationPaths.map(
      normalizeWebsitePath
    );

  for (
    let index = 0;
    index <
    normalizedSources.length;
    index += 1
  ) {
    const sourcePath =
      normalizedSources[index];

    const destinationPath =
      normalizedDestinations[index];

    if (
      sourcePath ===
      destinationPath
    ) {
      throw new Error(
        "Source and destination cannot be the same."
      );
    }

    if (
      destinationPath.startsWith(
        `${sourcePath}/`
      )
    ) {
      throw new Error(
        mode === "move"
          ? "An item cannot be moved inside itself."
          : "A folder cannot be copied inside itself."
      );
    }
  }

  const records =
    await findWebsiteFiles(
      websiteId
    );

  const sourceFiles =
    records.filter(
      (
        file
      ) =>
        normalizedSources.some(
          (
            sourcePath
          ) =>
            file.path ===
              sourcePath ||
            file.path.startsWith(
              `${sourcePath}/`
            )
        )
    );

  if (
    sourceFiles.length ===
    0
  ) {
    throw new Error(
      "Source file or folder was not found."
    );
  }

  for (
    const sourcePath
    of normalizedSources
  ) {
    const exists =
      sourceFiles.some(
        (
          file
        ) =>
          file.path ===
            sourcePath ||
          file.path.startsWith(
            `${sourcePath}/`
          )
      );

    if (!exists) {
      throw new Error(
        `Source item "${sourcePath}" was not found.`
      );
    }
  }

  const planned:
    PlannedFileOperation[] = [];

  for (
    let index = 0;
    index <
    normalizedSources.length;
    index += 1
  ) {
    const sourcePath =
      normalizedSources[index];

    const destinationPath =
      normalizedDestinations[index];

    const matchingFiles =
      sourceFiles.filter(
        (
          file
        ) =>
          file.path ===
            sourcePath ||
          file.path.startsWith(
            `${sourcePath}/`
          )
      );

    planned.push(
      ...buildOperationPlan({
        websiteId,
        sourcePath,
        destinationPath,
        sourceFiles:
          matchingFiles,
      })
    );
  }

  validatePlannedDestinations(
    planned
  );

  validateDestinationConflicts({
    records,
    planned,
    sourceFiles:
      mode === "move"
        ? sourceFiles
        : [],
    overwrite,
  });

  const storage =
    getR2StorageProvider();

  const copiedKeys:
    string[] = [];

  try {
    await mapWithConcurrency(
      planned,
      6,
      async (
        operation
      ) => {
        await storage.copy({
          sourceKey:
            operation.sourceObjectKey,

          destinationKey:
            operation.destinationObjectKey,
        });

        copiedKeys.push(
          operation.destinationObjectKey
        );
      }
    );

    await mapWithConcurrency(
      planned,
      8,
      async (
        operation
      ) => {
        const head =
          await storage.head(
            operation.destinationObjectKey
          );

        if (!head) {
          throw new Error(
            `Failed to verify copied file "${operation.destinationPath}".`
          );
        }

        await upsertWebsiteFile({
          websiteId,

          path:
            operation.destinationPath,

          objectKey:
            operation.destinationObjectKey,

          fileName:
            basename(
              operation.destinationPath
            ),

          contentType:
            head.contentType ??
            operation.contentType ??
            undefined,

          sizeBytes:
            head.contentLength,

          etag:
            head.etag ??
            undefined,

          checksumSha256:
            head.metadata
              .checksum_sha256 ??
            operation.checksumSha256 ??
            undefined,
        });
      }
    );

    if (
      mode ===
      "move"
    ) {
      await mapWithConcurrency(
        planned,
        8,
        async (
          operation
        ) => {
          await storage.delete(
            operation.sourceObjectKey
          );

          await deleteWebsiteFileMetadata(
            websiteId,
            operation.sourcePath
          );
        }
      );
    }
  } catch (
    error
  ) {
    await Promise.allSettled(
      copiedKeys.map(
        (
          key
        ) =>
          storage.delete(
            key
          )
      )
    );

    throw error;
  }

  return {
    sourcePaths:
      normalizedSources.map(
        (
          path
        ) =>
          `/${path}`
      ),

    destinationPaths:
      normalizedDestinations.map(
        (
          path
        ) =>
          `/${path}`
      ),

    affectedFiles:
      planned.length,
  };
}

function buildOperationPlan({
  websiteId,
  sourcePath,
  destinationPath,
  sourceFiles,
}: {
  websiteId: string;
  sourcePath: string;
  destinationPath: string;
  sourceFiles:
    Awaited<
      ReturnType<
        typeof findWebsiteFiles
      >
    >;
}): PlannedFileOperation[] {
  return sourceFiles.map(
    (
      file
    ) => {
      const relativePath =
        file.path ===
        sourcePath
          ? ""
          : file.path.slice(
              sourcePath.length +
                1
            );

      const nextPath =
        relativePath
          ? `${destinationPath}/${relativePath}`
          : destinationPath;

      return {
        sourcePath:
          file.path,

        destinationPath:
          nextPath,

        sourceObjectKey:
          file.object_key,

        destinationObjectKey:
          createWebsiteObjectKey(
            websiteId,
            nextPath
          ),

        contentType:
          file.content_type,

        checksumSha256:
          file.checksum_sha256,
      };
    }
  );
}

function validatePlannedDestinations(
  planned:
    PlannedFileOperation[]
) {
  const seen =
    new Set<string>();

  for (
    const operation
    of planned
  ) {
    if (
      seen.has(
        operation.destinationPath
      )
    ) {
      throw new Error(
        `Multiple selected items would create "${operation.destinationPath}".`
      );
    }

    seen.add(
      operation.destinationPath
    );
  }
}

function validateDestinationConflicts({
  records,
  planned,
  sourceFiles,
  overwrite,
}: {
  records:
    Awaited<
      ReturnType<
        typeof findWebsiteFiles
      >
    >;

  planned:
    PlannedFileOperation[];

  sourceFiles:
    Awaited<
      ReturnType<
        typeof findWebsiteFiles
      >
    >;

  overwrite:
    boolean;
}) {
  if (overwrite) {
    return;
  }

  const sourcePaths =
    new Set(
      sourceFiles.map(
        (
          file
        ) =>
          file.path
      )
    );

  const existingPaths =
    new Set(
      records
        .filter(
          (
            file
          ) =>
            !sourcePaths.has(
              file.path
            )
        )
        .map(
          (
            file
          ) =>
            file.path
        )
    );

  const conflict =
    planned.find(
      (
        operation
      ) =>
        existingPaths.has(
          operation.destinationPath
        )
    );

  if (conflict) {
    throw new Error(
      `A file already exists at "${conflict.destinationPath}".`
    );
  }
}

function collapseNestedPaths(
  paths: string[]
) {
  const unique =
    Array.from(
      new Set(
        paths
      )
    ).sort(
      (
        first,
        second
      ) =>
        first.length -
        second.length
    );

  const result:
    string[] = [];

  for (
    const path
    of unique
  ) {
    if (
      result.some(
        (
          parent
        ) =>
          path ===
            parent ||
          path.startsWith(
            `${parent}/`
          )
      )
    ) {
      continue;
    }

    result.push(
      path
    );
  }

  return result;
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

function normalizeWebsiteDirectory(
  value: string
) {
  const clean =
    value
      .trim()
      .replace(
        /\\/g,
        "/"
      );

  if (
    !clean ||
    clean ===
      "/"
  ) {
    return "";
  }

  return normalizeWebsitePath(
    clean
  );
}

function normalizeItemName(
  value: string
) {
  const name =
    value.trim();

  if (!name) {
    throw new Error(
      "Name cannot be empty."
    );
  }

  if (
    name === "." ||
    name === ".." ||
    name.includes("/") ||
    name.includes("\\") ||
    name.includes("\0")
  ) {
    throw new Error(
      "Invalid file or folder name."
    );
  }

  if (
    name.length >
    255
  ) {
    throw new Error(
      "Name is too long."
    );
  }

  return name;
}

function getParentPath(
  path: string
) {
  const parts =
    path
      .split("/")
      .filter(
        Boolean
      );

  parts.pop();

  return parts.join(
    "/"
  );
}

function getBaseName(
  path: string
) {
  const parts =
    path
      .split("/")
      .filter(
        Boolean
      );

  return parts[
    parts.length - 1
  ];
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
