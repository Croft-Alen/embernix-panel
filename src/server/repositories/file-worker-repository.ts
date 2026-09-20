import {
  basename,
} from "node:path";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type WorkerWebsiteFileRecord = {
  id: string;

  website_id: string;

  path: string;

  object_key: string;

  file_name: string;

  content_type:
    | string
    | null;

  size_bytes: number;

  etag:
    | string
    | null;

  checksum_sha256:
    | string
    | null;

  created_at: string;

  updated_at: string;
};

export type WorkerWebsiteFileUpsertInput = {
  websiteId:
    string;

  path:
    string;

  objectKey:
    string;

  contentType?:
    string;

  sizeBytes:
    number;

  etag?:
    string;

  checksumSha256?:
    string;
};

export async function requireWorkerWebsite(
  websiteId:
    string
) {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "websites"
      )
      .select(
        "id,deleted_at"
      )
      .eq(
        "id",
        websiteId
      )
      .is(
        "deleted_at",
        null
      )
      .maybeSingle();

  if (
    error
  ) {
    throw new Error(
      `Failed to load worker website: ${error.message}`
    );
  }

  if (
    !data
  ) {
    throw new Error(
      "Website not found."
    );
  }

  return data;
}

export async function findWorkerWebsiteFiles(
  websiteId:
    string
) {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "website_files"
      )
      .select(
        "*"
      )
      .eq(
        "website_id",
        websiteId
      )
      .order(
        "path",
        {
          ascending:
            true,
        }
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to load website files: ${error.message}`
    );
  }

  return (
    data ??
    []
  ) as
    WorkerWebsiteFileRecord[];
}

export async function findWorkerWebsiteFileByPath(
  websiteId:
    string,
  path:
    string
) {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "website_files"
      )
      .select(
        "*"
      )
      .eq(
        "website_id",
        websiteId
      )
      .eq(
        "path",
        path
      )
      .maybeSingle();

  if (
    error
  ) {
    throw new Error(
      `Failed to load website file: ${error.message}`
    );
  }

  return data as
    | WorkerWebsiteFileRecord
    | null;
}

export async function upsertWorkerWebsiteFile(
  input:
    WorkerWebsiteFileUpsertInput
) {
  const savedFiles =
    await upsertWorkerWebsiteFiles([
      input,
    ]);

  const saved =
    savedFiles[0];

  if (
    !saved
  ) {
    throw new Error(
      "Website file metadata was not saved."
    );
  }

  return saved;
}

export async function upsertWorkerWebsiteFiles(
  inputs:
    WorkerWebsiteFileUpsertInput[]
) {
  if (
    inputs.length ===
    0
  ) {
    return [];
  }

  const supabase =
    createAdminClient();

  const now =
    new Date()
      .toISOString();

  const rows =
    inputs.map(
      (
        input
      ) => ({
        website_id:
          input.websiteId,

        path:
          input.path,

        object_key:
          input.objectKey,

        file_name:
          basename(
            input.path
          ),

        content_type:
          input.contentType ??
          null,

        size_bytes:
          input.sizeBytes,

        etag:
          input.etag ??
          null,

        checksum_sha256:
          input.checksumSha256 ??
          null,

        updated_at:
          now,
      })
    );

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "website_files"
      )
      .upsert(
        rows,
        {
          onConflict:
            "website_id,path",
        }
      )
      .select(
        "*"
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to save website file metadata: ${error.message}`
    );
  }

  return (
    data ??
    []
  ) as
    WorkerWebsiteFileRecord[];
}

export async function deleteWorkerWebsiteFileMetadata(
  websiteId:
    string,
  path:
    string
) {
  const supabase =
    createAdminClient();

  const {
    error,
  } =
    await supabase
      .from(
        "website_files"
      )
      .delete()
      .eq(
        "website_id",
        websiteId
      )
      .eq(
        "path",
        path
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to delete website file metadata: ${error.message}`
    );
  }
}