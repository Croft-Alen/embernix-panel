import type {
  Env,
  FileOperationRecord,
  WebsiteFileRecord,
} from "./types";

type ProgressInput = {
  current?: number;
  total?: number;
  percent?: number;
  message?: string;
};

type WebsiteFileUpsertInput = {
  websiteId: string;
  path: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
  checksumSha256: string;
};

export async function claimFileOperation(
  env: Env,
  operationId: string
): Promise<FileOperationRecord | null> {
  const data =
    await supabaseRequest<FileOperationRecord | null>(
      env,
      "/rest/v1/rpc/claim_file_operation",
      {
        method: "POST",

        body: JSON.stringify({
          target_operation_id:
            operationId,

          worker_name:
            "embernix-system-worker",
        }),
      }
    );

  if (
    !data ||
    typeof data.id !==
      "string"
  ) {
    return null;
  }

  return data;
}

export async function getFileOperation(
  env: Env,
  operationId: string
): Promise<FileOperationRecord | null> {
  const rows =
    await supabaseRequest<
      FileOperationRecord[]
    >(
      env,
      `/rest/v1/file_operations?id=eq.${encodeURIComponent(
        operationId
      )}&limit=1`,
      {
        method: "GET",
      }
    );

  return rows[0] ?? null;
}

export async function updateFileOperationProgress(
  env: Env,
  operationId: string,
  input: ProgressInput
) {
  const patch:
    Record<string, unknown> = {
      updated_at:
        new Date().toISOString(),
    };

  if (
    input.current !==
    undefined
  ) {
    patch.progress_current =
      Math.max(
        0,
        input.current
      );
  }

  if (
    input.total !==
    undefined
  ) {
    patch.progress_total =
      Math.max(
        0,
        input.total
      );
  }

  if (
    input.percent !==
    undefined
  ) {
    patch.progress_percent =
      Math.min(
        100,
        Math.max(
          0,
          Math.round(
            input.percent
          )
        )
      );
  }

  if (
    input.message !==
    undefined
  ) {
    patch.progress_message =
      input.message;
  }

  await supabaseRequest(
    env,
    `/rest/v1/file_operations?id=eq.${encodeURIComponent(
      operationId
    )}&status=eq.running`,
    {
      method: "PATCH",
      body:
        JSON.stringify(
          patch
        ),
    }
  );
}

export async function completeFileOperation(
  env: Env,
  operationId: string,
  result:
    Record<string, unknown>
) {
  const now =
    new Date().toISOString();

  await supabaseRequest(
    env,
    `/rest/v1/file_operations?id=eq.${encodeURIComponent(
      operationId
    )}`,
    {
      method: "PATCH",

      body:
        JSON.stringify({
          status:
            "completed",

          result,

          progress_percent:
            100,

          progress_message:
            "Completed",

          completed_at:
            now,

          updated_at:
            now,
        }),
    }
  );
}

export async function failFileOperation(
  env: Env,
  operationId: string,
  message: string
) {
  const now =
    new Date().toISOString();

  await supabaseRequest(
    env,
    `/rest/v1/file_operations?id=eq.${encodeURIComponent(
      operationId
    )}`,
    {
      method: "PATCH",

      body:
        JSON.stringify({
          status:
            "failed",

          error_message:
            message,

          progress_message:
            "Failed",

          completed_at:
            now,

          updated_at:
            now,
        }),
    }
  );
}

export async function cancelRunningFileOperation(
  env: Env,
  operationId: string
) {
  const now =
    new Date().toISOString();

  await supabaseRequest(
    env,
    `/rest/v1/file_operations?id=eq.${encodeURIComponent(
      operationId
    )}`,
    {
      method: "PATCH",

      body:
        JSON.stringify({
          status:
            "canceled",

          progress_message:
            "Canceled",

          completed_at:
            now,

          updated_at:
            now,
        }),
    }
  );
}

export async function isFileOperationCancelRequested(
  env: Env,
  operationId: string
) {
  const rows =
    await supabaseRequest<
      Array<{
        cancel_requested:
          boolean;

        status:
          string;
      }>
    >(
      env,
      `/rest/v1/file_operations?id=eq.${encodeURIComponent(
        operationId
      )}&select=cancel_requested,status&limit=1`,
      {
        method:
          "GET",
      }
    );

  const row =
    rows[0];

  if (!row) {
    throw new Error(
      "File operation no longer exists."
    );
  }

  return (
    row.cancel_requested ===
      true ||
    row.status ===
      "canceled"
  );
}

export async function requireWebsite(
  env: Env,
  websiteId: string
) {
  const rows =
    await supabaseRequest<
      Array<{
        id:
          string;

        deleted_at:
          string | null;
      }>
    >(
      env,
      `/rest/v1/websites?id=eq.${encodeURIComponent(
        websiteId
      )}&deleted_at=is.null&select=id,deleted_at&limit=1`,
      {
        method:
          "GET",
      }
    );

  if (!rows[0]) {
    throw new Error(
      "Website not found."
    );
  }

  return rows[0];
}

export async function findWebsiteFileByPath(
  env: Env,
  websiteId: string,
  path: string
): Promise<WebsiteFileRecord | null> {
  const rows =
    await supabaseRequest<
      WebsiteFileRecord[]
    >(
      env,
      `/rest/v1/website_files?website_id=eq.${encodeURIComponent(
        websiteId
      )}&path=eq.${encodeURIComponent(
        path
      )}&limit=1`,
      {
        method:
          "GET",
      }
    );

  return rows[0] ?? null;
}

export async function findWebsiteFiles(
  env: Env,
  websiteId: string
): Promise<WebsiteFileRecord[]> {
  return supabaseRequest<
    WebsiteFileRecord[]
  >(
    env,
    `/rest/v1/website_files?website_id=eq.${encodeURIComponent(
      websiteId
    )}&order=path.asc`,
    {
      method:
        "GET",
    }
  );
}

export async function upsertWebsiteFiles(
  env: Env,
  inputs:
    WebsiteFileUpsertInput[]
) {
  if (
    inputs.length ===
    0
  ) {
    return;
  }

  const now =
    new Date().toISOString();

  const rows =
    inputs.map(
      (input) => ({
        website_id:
          input.websiteId,

        path:
          input.path,

        object_key:
          input.objectKey,

        file_name:
          getBaseName(
            input.path
          ),

        content_type:
          input.contentType,

        size_bytes:
          input.sizeBytes,

        etag:
          input.etag ??
          null,

        checksum_sha256:
          input.checksumSha256,

        updated_at:
          now,
      })
    );

  await supabaseRequest(
    env,
    "/rest/v1/website_files?on_conflict=website_id,path",
    {
      method:
        "POST",

      headers: {
        Prefer:
          "resolution=merge-duplicates,return=minimal",
      },

      body:
        JSON.stringify(
          rows
        ),
    }
  );
}

export async function deleteWebsiteFileMetadata(
  env: Env,
  websiteId: string,
  path: string
) {
  await supabaseRequest(
    env,
    `/rest/v1/website_files?website_id=eq.${encodeURIComponent(
      websiteId
    )}&path=eq.${encodeURIComponent(
      path
    )}`,
    {
      method:
        "DELETE",
    }
  );
}

async function supabaseRequest<T = unknown>(
  env: Env,
  pathname: string,
  init: RequestInit
): Promise<T> {
  const url =
    `${env.SUPABASE_URL.replace(
      /\/+$/,
      ""
    )}${pathname}`;

  const response =
    await fetch(
      url,
      {
        ...init,

        headers: {
          apikey:
            env
              .SUPABASE_SERVICE_ROLE_KEY,

          authorization:
            `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,

          "content-type":
            "application/json",

          Prefer:
            "return=minimal",

          ...(init.headers ??
            {}),
        },
      }
    );

  if (
    !response.ok
  ) {
    const body =
      await response.text();

    throw new Error(
      `Supabase request failed (${response.status}): ${body}`
    );
  }

  if (
    response.status ===
      204
  ) {
    return undefined as T;
  }

  const text =
    await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(
    text
  ) as T;
}

function getBaseName(
  path: string
) {
  const pieces =
    path
      .split("/")
      .filter(Boolean);

  return (
    pieces[
      pieces.length - 1
    ] ??
    path
  );
}