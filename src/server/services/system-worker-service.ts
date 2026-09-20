import "server-only";

export async function enqueueFileOperation(
  operationId:
    string
) {
  const baseUrl =
    process.env
      .EMBERNIX_SYSTEM_WORKER_URL;

  const secret =
    process.env
      .EMBERNIX_SYSTEM_WORKER_SECRET;

  if (
    !baseUrl
  ) {
    throw new Error(
      "EMBERNIX_SYSTEM_WORKER_URL is not configured."
    );
  }

  if (
    !secret
  ) {
    throw new Error(
      "EMBERNIX_SYSTEM_WORKER_SECRET is not configured."
    );
  }

  const response =
    await fetch(
      `${baseUrl.replace(
        /\/+$/,
        ""
      )}/internal/file-operations`,
      {
        method:
          "POST",

        headers: {
          authorization:
            `Bearer ${secret}`,

          "content-type":
            "application/json",
        },

        body:
          JSON.stringify({
            operationId,
          }),

        cache:
          "no-store",
      }
    );

  if (
    !response.ok
  ) {
    const body =
      await response.text();

    throw new Error(
      `Failed to enqueue system operation (${response.status}): ${body}`
    );
  }

  return response.json() as Promise<{
    success:
      boolean;

    queued:
      boolean;

    operationId:
      string;
  }>;
}