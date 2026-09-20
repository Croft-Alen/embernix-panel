import {
  createClient,
} from "@/lib/supabase/server";

export type WebsiteFileRecord = {
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

export type UpsertWebsiteFileInput = {
  websiteId: string;

  path: string;

  objectKey: string;

  fileName: string;

  contentType?: string;

  sizeBytes: number;

  etag?: string;

  checksumSha256?: string;
};

export async function findWebsiteFiles(
  websiteId: string
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "website_files"
    )
    .select(`
      id,
      website_id,
      path,
      object_key,
      file_name,
      content_type,
      size_bytes,
      etag,
      checksum_sha256,
      created_at,
      updated_at
    `)
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

  if (error) {
    throw new Error(
      `Failed to load website files: ${error.message}`
    );
  }

  return (
    data ??
    []
  ) as WebsiteFileRecord[];
}

export async function findWebsiteFileByPath(
  websiteId: string,
  path: string
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "website_files"
    )
    .select(`
      id,
      website_id,
      path,
      object_key,
      file_name,
      content_type,
      size_bytes,
      etag,
      checksum_sha256,
      created_at,
      updated_at
    `)
    .eq(
      "website_id",
      websiteId
    )
    .eq(
      "path",
      path
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load website file: ${error.message}`
    );
  }

  return data as
    | WebsiteFileRecord
    | null;
}

export async function upsertWebsiteFile(
  input: UpsertWebsiteFileInput
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "website_files"
    )
    .upsert(
      {
        website_id:
          input.websiteId,

        path:
          input.path,

        object_key:
          input.objectKey,

        file_name:
          input.fileName,

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
      },
      {
        onConflict:
          "website_id,path",
      }
    )
    .select(`
      id,
      website_id,
      path,
      object_key,
      file_name,
      content_type,
      size_bytes,
      etag,
      checksum_sha256,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw new Error(
      `Failed to save website file: ${error.message}`
    );
  }

  return data as WebsiteFileRecord;
}

export async function deleteWebsiteFileMetadata(
  websiteId: string,
  path: string
) {
  const supabase =
    await createClient();

  const {
    error,
  } = await supabase
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

  if (error) {
    throw new Error(
      `Failed to delete website file metadata: ${error.message}`
    );
  }
}

export async function getWebsiteStorageUsage(
  websiteId: string
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "website_files"
    )
    .select(
      "size_bytes"
    )
    .eq(
      "website_id",
      websiteId
    );

  if (error) {
    throw new Error(
      `Failed to calculate website storage usage: ${error.message}`
    );
  }

  return (
    data ??
    []
  ).reduce(
    (
      total,
      file
    ) =>
      total +
      Number(
        file.size_bytes
      ),
    0
  );
}