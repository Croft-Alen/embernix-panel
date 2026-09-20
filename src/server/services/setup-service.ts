import type {
  WebsiteSetupProgress,
} from "@/features/setup/types";

import {
  findWebsiteSetupProgress,
  findWebsiteSetupStatus,
  startWebsiteSetup,
  upsertWebsiteSetupProgress,
} from "@/server/repositories/setup-repository";

export async function getSetupProgress(
  websiteId: string
): Promise<WebsiteSetupProgress | null> {
  const status =
    await findWebsiteSetupStatus(
      websiteId
    );

  if (!status) {
    return null;
  }

  const progress =
    await findWebsiteSetupProgress(
      websiteId
    );

  return {
    websiteId,

    status:
      status.setup_status,

    currentStep:
      status.setup_status ===
      "completed"
        ? "deploy"
        : progress
            ?.current_step ??
          "source",

    source:
      progress?.source_type ??
      undefined,

    uploadedFileName:
      progress
        ?.uploaded_file_name ??
      undefined,

    repositoryUrl:
      progress?.repository_url ??
      undefined,

    detectedProject:
      progress
        ?.detected_framework &&
      progress.framework_label &&
      progress.install_command &&
      progress.build_command &&
      progress.output_directory
        ? {
            framework:
              progress.detected_framework,

            frameworkLabel:
              progress.framework_label,

            installCommand:
              progress.install_command,

            buildCommand:
              progress.build_command,

            outputDirectory:
              progress.output_directory,
          }
        : undefined,

    completedAt:
      status.setup_completed_at ??
      undefined,
  };
}

type SaveSetupProgressInput = Omit<
  WebsiteSetupProgress,
  "status" | "completedAt"
>;

export async function saveSetupProgress(
  input: SaveSetupProgressInput
) {
  await startWebsiteSetup(
    input.websiteId
  );

  await upsertWebsiteSetupProgress(
    {
      websiteId:
        input.websiteId,

      currentStep:
        input.currentStep,

      source:
        input.source,

      uploadedFileName:
        input.uploadedFileName,

      repositoryUrl:
        input.repositoryUrl,

      detectedProject:
        input.detectedProject,
    }
  );
}