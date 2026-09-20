import {
  createClient,
} from "@/lib/supabase/server";

export type WebsiteRecord = {
  id: string;

  hosting_service_id: string;

  name: string;

  slug: string;

  default_hostname: string;

  framework:
    | string
    | null;

  setup_status:
    | "not_started"
    | "in_progress"
    | "completed";

  operational_status:
    | "offline"
    | "online"
    | "building"
    | "failed"
    | "suspended";

  setup_completed_at:
    | string
    | null;

  created_at: string;

  updated_at: string;

  deleted_at:
    | string
    | null;
};

export async function findWebsitesForCurrentUser() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "websites"
    )
    .select(`
      id,
      hosting_service_id,
      name,
      slug,
      default_hostname,
      framework,
      setup_status,
      operational_status,
      setup_completed_at,
      created_at,
      updated_at,
      deleted_at
    `)
    .is(
      "deleted_at",
      null
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load websites: ${error.message}`
    );
  }

  return (
    data ??
    []
  ) as WebsiteRecord[];
}

export async function findWebsiteById(
  websiteId: string
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "websites"
    )
    .select(`
      id,
      hosting_service_id,
      name,
      slug,
      default_hostname,
      framework,
      setup_status,
      operational_status,
      setup_completed_at,
      created_at,
      updated_at,
      deleted_at
    `)
    .eq(
      "id",
      websiteId
    )
    .is(
      "deleted_at",
      null
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load website: ${error.message}`
    );
  }

  return data as
    | WebsiteRecord
    | null;
}

export async function softDeleteWebsite(
  websiteId: string
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "delete_website",
      {
        target_website_id:
          websiteId,
      }
    );

  if (error) {
    throw new Error(
      `Failed to delete website: ${error.message}`
    );
  }
}