import {
  Settings,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  WebsiteSettings,
} from "@/components/settings/website-settings";

import {
  getWebsiteSettings,
} from "@/server/services/settings-service";

type SettingsPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function SettingsPage({
  params,
}: SettingsPageProps) {
  const {
    siteId,
  } = await params;

  const settings =
    await getWebsiteSettings(
      siteId
    );

  if (!settings) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Settings
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Configure this website, its build behavior and project-level options.
        </p>
      </div>

      <WebsiteSettings
        initialSettings={
          settings
        }
      />
    </div>
  );
}