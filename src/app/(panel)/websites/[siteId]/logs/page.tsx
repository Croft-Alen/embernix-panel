import {
  ScrollText,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  EmptyRuntimeLogs,
} from "@/components/logs/empty-runtime-logs";

import {
  LogViewer,
} from "@/components/logs/log-viewer";

import {
  mockRuntimeLogs,
} from "@/features/logs/mock-logs";

type LogsPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

const websites = [
  {
    id: "site_01",
    setupRequired: false,
  },

  {
    id: "site_02",
    setupRequired: false,
  },

  {
    id: "site_03",
    setupRequired: true,
  },

  {
    id: "site_04",
    setupRequired: true,
  },
];

export default async function LogsPage({
  params,
}: LogsPageProps) {
  const {
    siteId,
  } =
    await params;

  const website =
    websites.find(
      (
        item
      ) =>
        item.id ===
        siteId
    );

  if (!website) {
    notFound();
  }

  const logs =
    mockRuntimeLogs.filter(
      (
        log
      ) =>
        log.websiteId ===
        siteId
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Runtime Logs
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Inspect requests, runtime events, warnings and application errors.
        </p>
      </div>

      {logs.length >
      0 ? (
        <LogViewer
          initialLogs={
            logs
          }
        />
      ) : (
        <EmptyRuntimeLogs
          siteId={
            siteId
          }
          setupRequired={
            website.setupRequired
          }
        />
      )}
    </div>
  );
}