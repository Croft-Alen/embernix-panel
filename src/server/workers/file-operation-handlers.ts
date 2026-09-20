import type {
  FileOperationRecord,
} from "@/features/file-operations/types";

import {
  isFileOperationCancelRequested,
  updateFileOperationProgress,
} from "@/server/repositories/file-operation-worker-repository";

import {
  runCreateZipOperation,
  runExtractZipOperation,
} from "@/server/workers/archive-operation-worker";

export async function executeFileOperation(
  operation:
    FileOperationRecord
) {
  const onProgress =
    async (
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
    ) => {
      await updateFileOperationProgress(
        operation.id,
        input
      );
    };

  const isCanceled =
    async () =>
      isFileOperationCancelRequested(
        operation.id
      );

  switch (
    operation.kind
  ) {
    case "extract_zip":
      return runExtractZipOperation({
        websiteId:
          operation.website_id,

        payload:
          operation.payload as {
            archivePath:
              string;

            destinationPath?:
              string;

            overwrite?:
              boolean;

            deleteArchiveAfter?:
              boolean;
          },

        onProgress,

        isCanceled,
      });

    case "create_zip":
      return runCreateZipOperation({
        websiteId:
          operation.website_id,

        payload:
          operation.payload as {
            paths:
              string[];

            archivePath:
              string;

            overwrite?:
              boolean;
          },

        onProgress,

        isCanceled,
      });

    case "move_items":
      throw new Error(
        "Background move handler is not implemented yet."
      );

    case "copy_items":
      throw new Error(
        "Background copy handler is not implemented yet."
      );

    default:
      throw new Error(
        `Unsupported file operation kind: ${operation.kind}`
      );
  }
}