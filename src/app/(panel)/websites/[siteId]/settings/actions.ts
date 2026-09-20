"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  PackageManager,
} from "@/features/settings/types";

import {
  requireUser,
} from "@/server/auth/require-user";

import {
  deleteWebsite,
} from "@/server/services/website-service";

import {
  saveWebsiteBuildSettings,
  saveWebsiteGeneralSettings,
} from "@/server/services/settings-service";

type SaveGeneralSettingsInput = {
  websiteId: string;
  name: string;
  subdomain: string;
  productionBranch: string;
};

export async function saveGeneralSettingsAction(
  input: SaveGeneralSettingsInput
) {
  await requireUser();

  await saveWebsiteGeneralSettings(
    {
      websiteId:
        input.websiteId,

      name:
        input.name,

      subdomain:
        normalizeSubdomain(
          input.subdomain
        ),

      productionBranch:
        input.productionBranch,
    }
  );

  revalidateWebsite(
    input.websiteId
  );

  return {
    success: true,
  };
}

type SaveBuildSettingsInput = {
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

export async function saveBuildSettingsAction(
  input: SaveBuildSettingsInput
) {
  await requireUser();

  await saveWebsiteBuildSettings(
    input
  );

  revalidateWebsite(
    input.websiteId
  );

  return {
    success: true,
  };
}

export async function deleteWebsiteAction(
  websiteId: string
) {
  await requireUser();

  await deleteWebsite(
    websiteId
  );

  revalidatePath(
    "/websites"
  );

  revalidatePath(
    `/websites/${websiteId}`
  );

  return {
    success: true,
  };
}

function revalidateWebsite(
  websiteId: string
) {
  revalidatePath(
    "/websites"
  );

  revalidatePath(
    `/websites/${websiteId}`
  );

  revalidatePath(
    `/websites/${websiteId}/settings`
  );
}

function normalizeSubdomain(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9-]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}