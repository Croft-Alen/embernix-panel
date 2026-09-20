import {
  cancelRunningFileOperation,
  claimFileOperation,
  completeFileOperation,
  failFileOperation,
  getFileOperation,
  isFileOperationCancelRequested,
} from "./supabase";

import {
  runExtractZipOperation,
  type ExtractZipPayload,
} from "./operations/extract-zip";

import type {
  Env,
  SystemQueueMessage,
} from "./types";

export default {
  async fetch(
    request:
      Request,
    env:
      Env
  ): Promise<Response> {
    const url =
      new URL(
        request.url
      );

    if (
      request.method ===
        "GET" &&
      url.pathname ===
        "/health"
    ) {
      return handleHealth(
        env
      );
    }

    if (
      request.method ===
        "POST" &&
      url.pathname ===
        "/internal/test-queue"
    ) {
      if (
        !isAuthorized(
          request,
          env
        )
      ) {
        return json(
          {
            error:
              "Unauthorized",
          },
          401
        );
      }

      await env
        .FILE_OPERATIONS_QUEUE
        .send({
          type:
            "ping",

          createdAt:
            new Date()
              .toISOString(),

          message:
            "Embernix queue test",
        });

      return json({
        success:
          true,

        queued:
          true,
      });
    }

    if (
      request.method ===
        "POST" &&
      url.pathname ===
        "/internal/file-operations"
    ) {
      if (
        !isAuthorized(
          request,
          env
        )
      ) {
        return json(
          {
            error:
              "Unauthorized",
          },
          401
        );
      }

      const payload =
        await readJson(
          request
        );

      const operationId =
        typeof payload
          .operationId ===
          "string"
          ? payload
              .operationId
              .trim()
          : "";

      if (
        !operationId
      ) {
        return json(
          {
            error:
              "operationId is required",
          },
          400
        );
      }

      await env
        .FILE_OPERATIONS_QUEUE
        .send({
          type:
            "file_operation",

          operationId,
        });

      return json({
        success:
          true,

        queued:
          true,

        operationId,
      });
    }

    return json(
      {
        error:
          "Not found",
      },
      404
    );
  },

  async queue(
    batch:
      MessageBatch<SystemQueueMessage>,
    env:
      Env
  ): Promise<void> {
    for (
      const message
      of batch.messages
    ) {
      if (
        message.body.type ===
        "ping"
      ) {
        console.log(
          "[system-worker] queue ping received",
          {
            id:
              message.id,

            createdAt:
              message.body
                .createdAt,

            message:
              message.body
                .message,
          }
        );

        message.ack();

        continue;
      }

      try {
        await processFileOperation(
          env,
          message.body
            .operationId
        );

        message.ack();
      } catch (
        error
      ) {
        console.error(
          "[system-worker] file operation consumer error",
          error
        );

        message.retry({
          delaySeconds:
            60,
        });
      }
    }
  },
} satisfies ExportedHandler<
  Env,
  SystemQueueMessage
>;

async function processFileOperation(
  env: Env,
  operationId:
    string
) {
  const operation =
    await claimFileOperation(
      env,
      operationId
    );

  if (
    !operation
  ) {
    const existing =
      await getFileOperation(
        env,
        operationId
      );

    if (
      !existing
    ) {
      console.warn(
        `[system-worker] operation ${operationId} no longer exists`
      );

      return;
    }

    if (
      existing.status ===
        "running"
    ) {
      throw new Error(
        `Operation ${operationId} is already running.`
      );
    }

    console.log(
      `[system-worker] operation ${operationId} already ${existing.status}`
    );

    return;
  }

  console.log(
    `[system-worker] claimed ${operation.id} (${operation.kind})`
  );

  try {
    if (
      operation.kind !==
      "extract_zip"
    ) {
      throw new Error(
        `Operation kind "${operation.kind}" is not supported by the Cloudflare worker yet.`
      );
    }

    const result =
      await runExtractZipOperation(
        env,
        {
          operationId:
            operation.id,

          websiteId:
            operation.website_id,

          payload:
            operation.payload as ExtractZipPayload,
        }
      );

    const cancelRequested =
      await isFileOperationCancelRequested(
        env,
        operation.id
      );

    if (
      cancelRequested ||
      result.canceled ===
        true
    ) {
      await cancelRunningFileOperation(
        env,
        operation.id
      );

      console.log(
        `[system-worker] canceled ${operation.id}`
      );

      return;
    }

    await completeFileOperation(
      env,
      operation.id,
      result
    );

    console.log(
      `[system-worker] completed ${operation.id}`
    );
  } catch (
    error
  ) {
    const message =
      error instanceof
        Error
        ? error.message
        : "Unknown file operation error.";

    try {
      const canceled =
        await isFileOperationCancelRequested(
          env,
          operation.id
        );

      if (
        canceled
      ) {
        await cancelRunningFileOperation(
          env,
          operation.id
        );

        console.log(
          `[system-worker] canceled ${operation.id}`
        );

        return;
      }
    } catch {
    }

    await failFileOperation(
      env,
      operation.id,
      message
    );

    console.error(
      `[system-worker] failed ${operation.id}: ${message}`
    );
  }
}

async function handleHealth(
  env:
    Env
) {
  try {
    const bucket =
      await env
        .FILES_BUCKET
        .list({
          limit:
            1,
        });

    return json({
      status:
        "ok",

      service:
        "embernix-system-worker",

      r2:
        "connected",

      objectsChecked:
        bucket.objects.length,
    });
  } catch (
    error
  ) {
    console.error(
      "[system-worker] R2 health check failed",
      error
    );

    return json(
      {
        status:
          "degraded",

        service:
          "embernix-system-worker",

        r2:
          "error",
      },
      500
    );
  }
}

function isAuthorized(
  request:
    Request,
  env:
    Env
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization
  ) {
    return false;
  }

  const prefix =
    "Bearer ";

  if (
    !authorization
      .startsWith(
        prefix
      )
  ) {
    return false;
  }

  const supplied =
    authorization
      .slice(
        prefix.length
      )
      .trim();

  return (
    supplied.length >
      0 &&
    supplied ===
      env
        .EMBERNIX_INTERNAL_SECRET
  );
}

async function readJson(
  request:
    Request
): Promise<
  Record<
    string,
    unknown
  >
> {
  try {
    return await request
      .json<
        Record<
          string,
          unknown
        >
      >();
  } catch {
    return {};
  }
}

function json(
  value:
    unknown,
  status =
    200
) {
  return new Response(
    JSON.stringify(
      value
    ),
    {
      status,

      headers: {
        "content-type":
          "application/json; charset=utf-8",

        "cache-control":
          "no-store",
      },
    }
  );
}