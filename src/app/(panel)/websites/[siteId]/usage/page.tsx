import {
  Activity,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  UsageSummary,
} from "@/components/usage/usage-summary";

import {
  UsageTable,
} from "@/components/usage/usage-table";

import {
  mockUsage,
} from "@/features/usage/mock-usage";

import type {
  WebsiteUsage,
} from "@/features/usage/types";

type UsagePageProps = {
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

function createEmptyUsage(
  siteId: string
): WebsiteUsage {
  return {
    websiteId: siteId,

    bandwidth: {
      used: 0,
      limit: 107374182400,
    },

    storage: {
      used: 0,
      limit: 1073741824,
    },

    buildMinutes: {
      used: 0,
      limit: 300,
    },

    requests: {
      used: 0,
      limit: 1000000,
    },

    daily: [],
  };
}

export default async function UsagePage({
  params,
}: UsagePageProps) {
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

  const existingUsage =
    mockUsage.find(
      (
        item
      ) =>
        item.websiteId ===
        siteId
    );

  const usage =
    existingUsage ??
    createEmptyUsage(
      siteId
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Usage
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Monitor resource usage and plan limits for this website.
        </p>
      </div>

      <UsageSummary
        usage={
          usage
        }
      />

      <UsageTable
        daily={
          usage.daily
        }
        setupRequired={
          website.setupRequired
        }
      />
    </div>
  );
}