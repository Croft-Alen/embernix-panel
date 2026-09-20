import type {
  DetectedFramework,
} from "@/features/setup/types";

import type {
  PackageManager,
  WebsiteSettings,
} from "@/features/settings/types";

import {
  confirmWebsiteBuildConfiguration,
  findWebsiteSettings,
  updateWebsiteGeneralSettings,
  upsertWebsiteSettings,
} from "@/server/repositories/settings-repository";

import {
  getWebsite,
} from "@/server/services/website-service";

export async function getWebsiteSettings(
  websiteId: string
): Promise<WebsiteSettings | null> {
  const website =
    await getWebsite(
      websiteId
    );

  if (!website) {
    return null;
  }

  const settings =
    await findWebsiteSettings(
      websiteId
    );

  return {
    websiteId:
      website.id,

    name:
      website.name,

    subdomain:
      website.slug,

    framework:
      website.frameworkLabel ??
      "Not detected",

    productionBranch:
      settings
        ?.production_branch ??
      "main",

    installCommand:
      settings
        ?.install_command ??
      "",

    buildCommand:
      settings
        ?.build_command ??
      "",

    outputDirectory:
      settings
        ?.output_directory ??
      "",

    nodeVersion:
      settings
        ?.node_version ??
      "20",

    packageManager:
      settings
        ?.package_manager ??
      "npm",

    autoDeploy:
      settings
        ?.auto_deploy ??
      false,
  };
}

type SaveWebsiteBuildSettingsInput = {
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

export async function saveWebsiteBuildSettings(
  input: SaveWebsiteBuildSettingsInput
) {
  await upsertWebsiteSettings(
    input
  );
}

type SaveWebsiteGeneralSettingsInput = {
  websiteId: string;

  name: string;

  subdomain: string;

  productionBranch: string;
};

export async function saveWebsiteGeneralSettings(
  input: SaveWebsiteGeneralSettingsInput
) {
  await updateWebsiteGeneralSettings(
    input
  );
}

type ConfirmBuildConfigurationInput = {
  websiteId: string;

  framework:
    DetectedFramework;

  installCommand: string;

  buildCommand: string;

  outputDirectory: string;
};

export async function confirmBuildConfiguration(
  input: ConfirmBuildConfigurationInput
) {
  await confirmWebsiteBuildConfiguration(
    input
  );
}