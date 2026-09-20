import {
  createClient,
} from "@/lib/supabase/server";

import type {
  DetectedFramework,
} from "@/features/setup/types";

import type {
  PackageManager,
} from "@/features/settings/types";

export type WebsiteSettingsRecord = {
  website_id: string;

  install_command:
    | string
    | null;

  build_command:
    | string
    | null;

  output_directory:
    | string
    | null;

  node_version: string;

  package_manager:
    PackageManager;

  auto_deploy: boolean;

  production_branch: string;

  created_at: string;

  updated_at: string;
};

export async function findWebsiteSettings(
  websiteId: string
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "website_settings"
    )
    .select(`
      website_id,
      install_command,
      build_command,
      output_directory,
      node_version,
      package_manager,
      auto_deploy,
      production_branch,
      created_at,
      updated_at
    `)
    .eq(
      "website_id",
      websiteId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load website settings: ${error.message}`
    );
  }

  return data as
    | WebsiteSettingsRecord
    | null;
}

type UpsertWebsiteSettingsInput = {
  websiteId: string;

  installCommand: string;

  buildCommand: string;

  outputDirectory: string;

  nodeVersion: string;

  packageManager:
    PackageManager;

  autoDeploy: boolean;

  productionBranch: string;
};

export async function upsertWebsiteSettings(
  input: UpsertWebsiteSettingsInput
) {
  const supabase =
    await createClient();

  const {
    error,
  } = await supabase
    .from(
      "website_settings"
    )
    .upsert(
      {
        website_id:
          input.websiteId,

        install_command:
          input.installCommand,

        build_command:
          input.buildCommand,

        output_directory:
          input.outputDirectory,

        node_version:
          input.nodeVersion,

        package_manager:
          input.packageManager,

        auto_deploy:
          input.autoDeploy,

        production_branch:
          input.productionBranch,
      },
      {
        onConflict:
          "website_id",
      }
    );

  if (error) {
    throw new Error(
      `Failed to save website settings: ${error.message}`
    );
  }
}

type ConfirmWebsiteBuildConfigurationInput = {
  websiteId: string;

  framework:
    DetectedFramework;

  installCommand: string;

  buildCommand: string;

  outputDirectory: string;
};

export async function confirmWebsiteBuildConfiguration(
  input: ConfirmWebsiteBuildConfigurationInput
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "confirm_website_build_configuration",
      {
        target_website_id:
          input.websiteId,

        target_framework:
          input.framework,

        target_install_command:
          input.installCommand,

        target_build_command:
          input.buildCommand,

        target_output_directory:
          input.outputDirectory,
      }
    );

  if (error) {
    throw new Error(
      `Failed to confirm website build configuration: ${error.message}`
    );
  }
}

type UpdateWebsiteGeneralSettingsInput = {
  websiteId: string;

  name: string;

  subdomain: string;

  productionBranch: string;
};

export async function updateWebsiteGeneralSettings(
  input: UpdateWebsiteGeneralSettingsInput
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "update_website_general_settings",
      {
        target_website_id:
          input.websiteId,

        target_name:
          input.name,

        target_slug:
          input.subdomain,

        target_production_branch:
          input.productionBranch,
      }
    );

  if (error) {
    throw new Error(
      `Failed to save general settings: ${error.message}`
    );
  }
}