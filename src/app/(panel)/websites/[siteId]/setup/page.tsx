import {
  notFound,
} from "next/navigation";

import {
  SetupWizard,
} from "@/components/setup/setup-wizard";

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

  const setupProgress =
    await getSetupProgress(
      siteId
    );

  return (
    <SetupWizard
      websiteId={
        siteId
      }
      websiteName={
        website.name
      }
      defaultHostname={
        website.default_hostname
      }
      initialSetup={
        setupProgress
      }
    />
  );
}