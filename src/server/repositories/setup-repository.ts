import {
  createClient,
} from "@/lib/supabase/server";

import type {
  DetectedFramework,
  SetupSource,
  SetupStep,
} from "@/features/setup/types";

export type WebsiteSetupProgressRecord = {
  website_id:
    string;

  current_step:
    SetupStep;

  source_type:
    | SetupSource
    | null;

  uploaded_file_name:
    | string
    | null;

  repository_url:
    | string
    | null;

  detected_framework:
    | DetectedFramework
    | null;

  framework_label:
    | string
    | null;

  install_command:
    | string
    | null;

  build_command:
    | string
    | null;

  output_directory:
    | string
    | null;

  created_at:
    string;

  updated_at:
    string;
};

export type WebsiteSetupStatusRecord = {
  id:
    string;

  setup_status:
    | "not_started"
    | "in_progress"
    | "completed";

  setup_completed_at:
    | string
    | null;
};

export async function findWebsiteSetupStatus(
  websiteId:
    string
) {
  requireWebsiteId(
    websiteId
  );

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "websites"
      )
      .select(`
        id,
        setup_status,
        setup_completed_at
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

  if (
    error
  ) {
    throw new Error(
      `Failed to load website setup status: ${error.message}`
    );
  }

  return data as
    | WebsiteSetupStatusRecord
    | null;
}

export async function findWebsiteSetupProgress(
  websiteId:
    string
) {
  requireWebsiteId(
    websiteId
  );

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "website_setup_progress"
      )
      .select(`
        website_id,
        current_step,
        source_type,
        uploaded_file_name,
        repository_url,
        detected_framework,
        framework_label,
        install_command,
        build_command,
        output_directory,
        created_at,
        updated_at
      `)
      .eq(
        "website_id",
        websiteId
      )
      .maybeSingle();

  if (
    error
  ) {
    throw new Error(
      `Failed to load website setup progress: ${error.message}`
    );
  }

  return data as
    | WebsiteSetupProgressRecord
    | null;
}

export async function startWebsiteSetup(
  websiteId:
    string
) {
  requireWebsiteId(
    websiteId
  );

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "start_website_setup",
      {
        target_website_id:
          websiteId,
      }
    );

  if (
    error
  ) {
    throw new Error(
      `Failed to start website setup: ${error.message}`
    );
  }
}

type SaveWebsiteSetupProgressInput = {
  websiteId:
    string;

  currentStep:
    SetupStep;

  source?:
    SetupSource;

  uploadedFileName?:
    string;

  repositoryUrl?:
    string;

  detectedProject?: {
    framework:
      DetectedFramework;

    frameworkLabel:
      string;

    installCommand:
      string;

    buildCommand:
      string;

    outputDirectory:
      string;
  };
};

export async function upsertWebsiteSetupProgress(
  input:
    SaveWebsiteSetupProgressInput
) {
  requireWebsiteId(
    input.websiteId
  );

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase
      .from(
        "website_setup_progress"
      )
      .upsert(
        {
          website_id:
            input.websiteId,

          current_step:
            input.currentStep,

          source_type:
            input.source ??
            null,

          uploaded_file_name:
            input.uploadedFileName ??
            null,

          repository_url:
            input.repositoryUrl ??
            null,

          detected_framework:
            input.detectedProject
              ?.framework ??
            null,

          framework_label:
            input.detectedProject
              ?.frameworkLabel ??
            null,

          install_command:
            input.detectedProject
              ?.installCommand ??
            null,

          build_command:
            input.detectedProject
              ?.buildCommand ??
            null,

          output_directory:
            input.detectedProject
              ?.outputDirectory ??
            null,
        },
        {
          onConflict:
            "website_id",
        }
      );

  if (
    error
  ) {
    throw new Error(
      `Failed to save website setup progress: ${error.message}`
    );
  }
}

function requireWebsiteId(
  websiteId:
    string
) {
  if (
    typeof websiteId !==
      "string" ||
    !websiteId.trim() ||
    websiteId ===
      "undefined"
  ) {
    throw new Error(
      "Website ID is required."
    );
  }
}