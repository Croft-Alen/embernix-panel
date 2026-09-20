import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let adminClient:
  SupabaseClient<any> | null =
  null;

export function createAdminClient():
  SupabaseClient<any> {
  if (
    adminClient
  ) {
    return adminClient;
  }

  const url =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (
    !url ||
    !serviceRoleKey
  ) {
    throw new Error(
      "Supabase admin configuration is incomplete."
    );
  }

  adminClient =
    createClient(
      url,
      serviceRoleKey,
      {
        auth: {
          persistSession:
            false,

          autoRefreshToken:
            false,

          detectSessionInUrl:
            false,
        },
      }
    );

  return adminClient;
}