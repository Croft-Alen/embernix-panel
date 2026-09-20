import {
  createClient,
} from "@/lib/supabase/server";

import type {
  FileOperationKind,
  FileOperationRecord,
} from "@/features/file-operations/types";

export async function createFileOperation(
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
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },

    error:
      userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "You must be signed in."
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "file_operations"
      )
      .insert({
        website_id:
          input.websiteId,

        created_by:
          user.id,

        kind:
          input.kind,

        payload:
          input.payload,

        status:
          "queued",

        progress_current:
          0,

        progress_total:
          0,

        progress_percent:
          0,

        progress_message:
          "Queued",
      })
      .select(
        "*"
      )
      .single();

  if (
    error
  ) {
    throw new Error(
      `Failed to queue file operation: ${error.message}`
    );
  }

  return data as
    FileOperationRecord;
}

export async function findFileOperations(
  websiteId:
    string,
  limit =
    25
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "file_operations"
      )
      .select(
        "*"
      )
      .eq(
        "website_id",
        websiteId
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      )
      .limit(
        Math.min(
          Math.max(
            limit,
            1
          ),
          100
        )
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to load file operations: ${error.message}`
    );
  }

  return (
    data ??
    []
  ) as
    FileOperationRecord[];
}

export async function cancelFileOperation(
  operationId:
    string
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "cancel_file_operation",
      {
        target_operation_id:
          operationId,
      }
    );

  if (
    error
  ) {
    throw new Error(
      `Failed to cancel file operation: ${error.message}`
    );
  }

  return data as
    FileOperationRecord;
}