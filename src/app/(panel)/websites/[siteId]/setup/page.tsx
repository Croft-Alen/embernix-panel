import {
  notFound,
} from "next/navigation";

import {
  SetupWizard,
} from "@/components/setup/setup-wizard";

import type {
  WebsiteSetupProgress,
} from "@/features/setup/types";

import {
  getWebsite,
} from "@/server/services/website-service";

import {
  getSetupProgress,
} from "@/server/services/setup-service";

type SetupPageProps = {
  params:
    Promise<{
      siteId:
        string;
    }>;
};

export default async function SetupPage({
  params,
}: SetupPageProps) {
  const {
    siteId,
  } =
    await params;

  const website =
    await getWebsite(
      siteId
    );

  if (
    !website
  ) {
    notFound();
  }

  const savedSetup =
    await getSetupProgress(
      siteId
    );

  const initialSetup =
    savedSetup ??
    ({
      websiteId:
        siteId,

      status:
        website
          .setup_status,

      currentStep:
        website
          .setup_status ===
        "completed"
          ? "deploy"
          : "source",

      completedAt:
        website
          .setup_completed_at ??
        undefined,
    } satisfies WebsiteSetupProgress);

  return (
    <SetupWizard
      websiteId={
        siteId
      }
      websiteName={
        website.name
      }
      defaultHostname={
        website
          .default_hostname
      }
      initialSetup={
        initialSetup
      }
    />
  );
}