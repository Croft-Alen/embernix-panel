import {
  hostname,
} from "node:os";

import {
  loadEnvConfig,
} from "@next/env";

import {
  cancelRunningFileOperation,
  claimNextFileOperation,
  completeFileOperation,
  failFileOperation,
  isFileOperationCancelRequested,
} from "@/server/repositories/file-operation-worker-repository";

import {
  executeFileOperation,
} from "@/server/workers/file-operation-handlers";

const workerId =
  `${hostname()}:${process.pid}`;

const pollIntervalMs =
  Math.max(
    250,
    Number(
      process.env
        .FILE_OPERATION_POLL_MS ??
        1000
    )
  );

let stopping =
  false;

async function main() {
  loadEnvConfig(
    process.cwd()
  );

  process.on(
    "SIGINT",
    () => {
      stopping =
        true;
    }
  );

  process.on(
    "SIGTERM",
    () => {
      stopping =
        true;
    }
  );

  console.log(
    `[file-worker] started as ${workerId}`
  );

  while (
    !stopping
  ) {
    try {
      const operation =
        await claimNextFileOperation(
          workerId
        );

      if (
        !operation
      ) {
        await sleep(
          pollIntervalMs
        );

        continue;
      }

      console.log(
        `[file-worker] claimed ${operation.id} (${operation.kind})`
      );

      try {
        const result =
          await executeFileOperation(
            operation
          );

        const cancelRequested =
          await isFileOperationCancelRequested(
            operation.id
          );

        const operationCanceled =
          Boolean(
            result &&
            typeof result ===
              "object" &&
            "canceled" in
              result &&
            result.canceled ===
              true
          );

        if (
          cancelRequested ||
          operationCanceled
        ) {
          await cancelRunningFileOperation(
            operation.id
          );

          console.log(
            `[file-worker] canceled ${operation.id}`
          );

          continue;
        }

        await completeFileOperation(
          operation.id,
          result as Record<
            string,
            unknown
          >
        );

        console.log(
          `[file-worker] completed ${operation.id}`
        );
      } catch (
        operationError
      ) {
        const message =
          operationError instanceof
            Error
            ? operationError.message
            : "Unknown file operation error.";

        try {
          const canceled =
            await isFileOperationCancelRequested(
              operation.id
            );

          if (
            canceled
          ) {
            await cancelRunningFileOperation(
              operation.id
            );

            console.log(
              `[file-worker] canceled ${operation.id}`
            );
          } else {
            await failFileOperation(
              operation.id,
              message
            );

            console.error(
              `[file-worker] failed ${operation.id}: ${message}`
            );
          }
        } catch (
          statusError
        ) {
          console.error(
            `[file-worker] failed to persist state for ${operation.id}`,
            statusError
          );
        }
      }
    } catch (
      error
    ) {
      console.error(
        "[file-worker] loop error",
        error
      );

      await sleep(
        pollIntervalMs
      );
    }
  }

  console.log(
    "[file-worker] stopped"
  );
}

function sleep(
  milliseconds:
    number
) {
  return new Promise<void>(
    (
      resolve
    ) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

void main().catch(
  (
    error
  ) => {
    console.error(
      "[file-worker] fatal error",
      error
    );

    process.exitCode =
      1;
  }
);