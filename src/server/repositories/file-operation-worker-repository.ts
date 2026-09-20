import {
  createAdminClient,
} from "@/lib/supabase/admin";

import type {
  FileOperationRecord,
} from "@/features/file-operations/types";

export async function claimNextFileOperation(
  workerId:
    string
): Promise<
  FileOperationRecord | null
> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "claim_next_file_operation",
      {
        worker_name:
          workerId,
      }
    );

  if (
    error
  ) {
    throw new Error(
      `Failed to claim file operation: ${error.message}`
    );
  }

  const row =
    Array.isArray(
      data
    )
      ? data[0]
      : data;

  if (
    !row ||
    typeof row !==
      "object" ||
    typeof row.id !==
      "string" ||
    !row.id
  ) {
    return null;
  }

  return row as
    FileOperationRecord;
}

export async function updateFileOperationProgress(
  operationId:
    string,
  input: {
    current?:
      number;

    total?:
      number;

    percent?:
      number;

    message?:
      string;
  }
) {
  const supabase =
    createAdminClient();

  const patch:
    Record<
      string,
      unknown
    > = {
      updated_at:
        new Date()
          .toISOString(),
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

  const {
    error,
  } =
    await supabase
      .from(
        "file_operations"
      )
      .update(
        patch
      )
      .eq(
        "id",
        operationId
      )
      .eq(
        "status",
        "running"
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to update operation progress: ${error.message}`
    );
  }
}

export async function completeFileOperation(
  operationId:
    string,
  result:
    Record<
      string,
      unknown
    >
) {
  const supabase =
    createAdminClient();

  const now =
    new Date()
      .toISOString();

  const {
    error,
  } =
    await supabase
      .from(
        "file_operations"
      )
      .update({
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
      })
      .eq(
        "id",
        operationId
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to complete file operation: ${error.message}`
    );
  }
}

export async function failFileOperation(
  operationId:
    string,
  message:
    string
) {
  const supabase =
    createAdminClient();

  const now =
    new Date()
      .toISOString();

  const {
    error,
  } =
    await supabase
      .from(
        "file_operations"
      )
      .update({
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
      })
      .eq(
        "id",
        operationId
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to mark operation as failed: ${error.message}`
    );
  }
}

export async function cancelRunningFileOperation(
  operationId:
    string
) {
  const supabase =
    createAdminClient();

  const now =
    new Date()
      .toISOString();

  const {
    error,
  } =
    await supabase
      .from(
        "file_operations"
      )
      .update({
        status:
          "canceled",

        progress_message:
          "Canceled",

        completed_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "id",
        operationId
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to mark operation as canceled: ${error.message}`
    );
  }
}

export async function isFileOperationCancelRequested(
  operationId:
    string
) {
  if (
    !operationId
  ) {
    throw new Error(
      "Operation ID is required."
    );
  }

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "file_operations"
      )
      .select(
        "cancel_requested,status"
      )
      .eq(
        "id",
        operationId
      )
      .maybeSingle();

  if (
    error
  ) {
    throw new Error(
      `Failed to read operation state: ${error.message}`
    );
  }

  if (
    !data
  ) {
    throw new Error(
      "File operation no longer exists."
    );
  }

  return (
    data.cancel_requested ===
      true ||
    data.status ===
      "canceled"
  );
}