"use server";

import {
  revalidatePath,
} from "next/cache";

import type {
  DetectedFramework,
  WebsiteSetupProgress,
} from "@/features/setup/types";

import {
  requireUser,
} from "@/server/auth/require-user";

import {
  getSetupProgress,
  saveSetupProgress,
} from "@/server/services/setup-service";

import {
  confirmBuildConfiguration,
} from "@/server/services/settings-service";

export async function getSetupProgressAction(
  websiteId:
    string
) {
  await requireUser();

  requireWebsiteId(
    websiteId
  );

  return getSetupProgress(
    websiteId
  );
}

type SaveSetupProgressActionInput =
  Omit<
    WebsiteSetupProgress,
    "status" |
      "completedAt"
  >;

export async function saveSetupProgressAction(
  input:
    SaveSetupProgressActionInput
) {
  await requireUser();

  requireWebsiteId(
    input.websiteId
  );

  await saveSetupProgress(
    input
  );

  revalidatePath(
    `/websites/${input.websiteId}`
  );

  revalidatePath(
    `/websites/${input.websiteId}/setup`
  );

  return {
    success:
      true,
  };
}

type SaveBuildSettingsActionInput = {
  websiteId:
    string;

  framework:
    DetectedFramework;

  installCommand:
    string;

  buildCommand:
    string;

  outputDirectory:
    string;
};

export async function saveBuildSettingsAction(
  input:
    SaveBuildSettingsActionInput
) {
  await requireUser();

  requireWebsiteId(
    input.websiteId
  );

  await confirmBuildConfiguration({
    websiteId:
      input.websiteId,

    framework:
      input.framework,

    installCommand:
      input.installCommand,

    buildCommand:
      input.buildCommand,

    outputDirectory:
      input.outputDirectory,
  });

  revalidatePath(
    "/websites"
  );

  revalidatePath(
    `/websites/${input.websiteId}`
  );

  revalidatePath(
    `/websites/${input.websiteId}/setup`
  );

  revalidatePath(
    `/websites/${input.websiteId}/settings`
  );

  return {
    success:
      true,
  };
}

function requireWebsiteId(
  websiteId:
    string
) {
  if (
    typeof websiteId !==
      "string" ||
    !websiteId.trim()
  ) {
    throw new Error(
      "Website ID is required."
    );
  }
}