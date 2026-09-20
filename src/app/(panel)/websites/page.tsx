import {
  WebsitesDashboard,
} from "@/components/websites/websites-dashboard";

import {
  listWebsites,
} from "@/server/services/website-service";

export default async function WebsitesPage() {
  const websites =
    await listWebsites();

  return (
    <WebsitesDashboard
      websites={
        websites
      }
    />
  );
}