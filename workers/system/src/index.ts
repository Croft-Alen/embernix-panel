export interface Env {
  FILES_BUCKET:
    R2Bucket;

  FILE_OPERATIONS_QUEUE:
    Queue<SystemQueueMessage>;

  EMBERNIX_INTERNAL_SECRET:
    string;
}

type SystemQueueMessage =
  | {
      type:
        "ping";

      createdAt:
        string;

      message:
        string;
    }
  | {
      type:
        "file_operation";

      operationId:
        string;
    };

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
      const authorized =
        isAuthorized(
          request,
          env
        );

      if (
        !authorized
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
      try {
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

        if (
          message.body.type ===
          "file_operation"
        ) {
          console.log(
            "[system-worker] file operation received",
            {
              id:
                message.id,

              operationId:
                message.body
                  .operationId,
            }
          );

          /*
           * Real file-operation execution comes
           * in the next slice.
           *
           * Do not ACK real operations yet.
           */

          message.retry({
            delaySeconds:
              60,
          });

          continue;
        }

        message.ack();
      } catch (
        error
      ) {
        console.error(
          "[system-worker] queue message failed",
          error
        );

        message.retry();
      }
    }
  },
} satisfies
  ExportedHandler<
    Env,
    SystemQueueMessage
  >;

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
    !authorization.startsWith(
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