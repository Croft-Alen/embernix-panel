"use server";

import {
  requireUser,
} from "@/server/auth/require-user";

import {
  listFileOperations,
  queueFileOperation,
  requestFileOperationCancel,
} from "@/server/services/file-operation-queue-service";

export async function queueExtractArchiveAction(
  websiteId:
    string,
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

  return queueFileOperation({
    websiteId,

    kind:
      "extract_zip",

    payload: {
      archivePath:
        input.archivePath,

      destinationPath:
        input.destinationPath,

      overwrite:
        input.overwrite,

      deleteArchiveAfter:
        input.deleteArchiveAfter,
    },
  });
}

export async function queueCreateArchiveAction(
  websiteId:
    string,
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

  return queueFileOperation({
    websiteId,

    kind:
      "create_zip",

    payload: {
      paths:
        input.paths,

      archivePath:
        input.archivePath,

      overwrite:
        input.overwrite,
    },
  });
}

export async function listFileOperationsAction(
  websiteId:
    string
) {
  await requireUser();

  return listFileOperations(
    websiteId,
    25
  );
}

export async function cancelFileOperationAction(
  operationId:
    string
) {
  await requireUser();

  return requestFileOperationCancel(
    operationId
  );
}