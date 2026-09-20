import {
  cancelFileOperation,
  createFileOperation,
  findFileOperations,
} from "@/server/repositories/file-operation-repository";

import type {
  FileOperationKind,
} from "@/features/file-operations/types";

import {
  getWebsite,
} from "@/server/services/website-service";

export async function queueFileOperation(
  input: {
    websiteId:
      string;

    kind:
      FileOperationKind;

    payload:
      Record<
        string,
        unknown
      >;
  }
) {
  await requireExistingWebsite(
    input.websiteId
  );

  return createFileOperation(
    input
  );
}

export async function listFileOperations(
  websiteId:
    string,
  limit =
    25
) {
  await requireExistingWebsite(
    websiteId
  );

  return findFileOperations(
    websiteId,
    limit
  );
}

export async function requestFileOperationCancel(
  operationId:
    string
) {
  return cancelFileOperation(
    operationId
  );
}

async function requireExistingWebsite(
  websiteId:
    string
) {
  const website =
    await getWebsite(
      websiteId
    );

  if (
    !website
  ) {
    throw new Error(
      "Website not found."
    );
  }

  return website;
}