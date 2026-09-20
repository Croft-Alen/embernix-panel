import {
  notFound,
} from "next/navigation";

import {
  WebsiteOverview,
} from "@/components/websites/website-overview";

import {
  getWebsite,
} from "@/server/services/website-service";

type WebsitePageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function WebsitePage({
  params,
}: WebsitePageProps) {
  const {
    siteId,
  } = await params;

  const website =
    await getWebsite(
      siteId
    );

  if (!website) {
    notFound();
  }

  return (
    <WebsiteOverview
      siteId={
        website.id
      }
      name={
        website.name
      }
      domain={
        website.default_hostname
      }
      framework={
        website.frameworkLabel
      }
      setupStatus={
        website.setup_status
      }
      storage="0 MB"
      bandwidth="0 B"
      deploymentStatus="not_deployed"
      publicUrl={`https://${website.default_hostname}`}
    />
  );
}