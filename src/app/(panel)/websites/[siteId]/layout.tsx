import {
  notFound,
} from "next/navigation";

import {
  WebsitePanelShell,
} from "@/components/layout/website-panel-shell";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getWebsite,
} from "@/server/services/website-service";

type WebsiteLayoutProps = {
  children:
    React.ReactNode;

  params:
    Promise<{
      siteId:
        string;
    }>;
};

export default async function WebsiteLayout({
  children,
  params,
}: WebsiteLayoutProps) {
  const {
    siteId,
  } =
    await params;

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

 

  const website =
    await getWebsite(
      siteId
    );


  if (!website) {
    notFound();
  }

  return (
    <WebsitePanelShell
      siteId={
        website.id
      }
      websiteName={
        website.name
      }
      domain={
        website.default_hostname
      }
    >
      {children}
    </WebsitePanelShell>
  );
}