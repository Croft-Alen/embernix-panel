import {
  Archive,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  BackupList,
} from "@/components/backups/backup-list";

import {
  UnavailableBackups,
} from "@/components/backups/unavailable-backups";

import {
  mockBackups,
} from "@/features/backups/mock-backups";

type BackupsPageProps = {
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

export default async function BackupsPage({
  params,
}: BackupsPageProps) {
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

  const backups =
    mockBackups.filter(
      (
        backup
      ) =>
        backup.websiteId ===
        siteId
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Backups
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Create, download and restore website backups.
        </p>
      </div>

      {website.setupRequired ? (
        <UnavailableBackups
          siteId={
            siteId
          }
        />
      ) : (
        <BackupList
          initialBackups={
            backups
          }
          websiteId={
            siteId
          }
        />
      )}
    </div>
  );
}