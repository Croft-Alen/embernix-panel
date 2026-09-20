"use server";

import {
  requireUser,
} from "@/server/auth/require-user";

import {
  createFileOperation,
} from "@/server/repositories/file-operation-repository";

import {
  enqueueFileOperation,
} from "@/server/services/system-worker-service";

export async function queueExtractWebsiteArchiveAction(
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

  const operation =
    await createFileOperation({
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

  await enqueueFileOperation(
    operation.id
  );

  return operation;
}