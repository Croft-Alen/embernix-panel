import {
  Clock3,
  Database,
  Globe2,
  HardDrive,
} from "lucide-react";

import {
  UsageCard,
} from "@/components/usage/usage-card";

import type {
  WebsiteUsage,
} from "@/features/usage/types";

type UsageSummaryProps = {
  usage: WebsiteUsage;
};

export function UsageSummary({
  usage,
}: UsageSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <UsageCard
        icon={
          <Globe2 className="h-5 w-5" />
        }
        title="Bandwidth"
        value={`${formatBytes(
          usage.bandwidth.used
        )} / ${formatBytes(
          usage.bandwidth.limit
        )}`}
        percentage={getPercentage(
          usage.bandwidth.used,
          usage.bandwidth.limit
        )}
      />

      <UsageCard
        icon={
          <HardDrive className="h-5 w-5" />
        }
        title="Storage"
        value={`${formatBytes(
          usage.storage.used
        )} / ${formatBytes(
          usage.storage.limit
        )}`}
        percentage={getPercentage(
          usage.storage.used,
          usage.storage.limit
        )}
      />

      <UsageCard
        icon={
          <Clock3 className="h-5 w-5" />
        }
        title="Build Minutes"
        value={`${usage.buildMinutes.used} / ${usage.buildMinutes.limit}`}
        percentage={getPercentage(
          usage.buildMinutes.used,
          usage.buildMinutes.limit
        )}
      />

      <UsageCard
        icon={
          <Database className="h-5 w-5" />
        }
        title="Requests"
        value={`${formatNumber(
          usage.requests.used
        )} / ${formatNumber(
          usage.requests.limit
        )}`}
        percentage={getPercentage(
          usage.requests.used,
          usage.requests.limit
        )}
      />
    </div>
  );
}

function getPercentage(
  used: number,
  limit: number
) {
  if (
    limit <= 0
  ) {
    return 0;
  }

  return (
    used /
    limit
  ) * 100;
}

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en"
  ).format(
    value
  );
}

function formatBytes(
  bytes: number
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  const kb =
    bytes / 1024;

  if (
    kb <
    1024
  ) {
    return `${kb.toFixed(
      1
    )} KB`;
  }

  const mb =
    kb / 1024;

  if (
    mb <
    1024
  ) {
    return `${mb.toFixed(
      1
    )} MB`;
  }

  const gb =
    mb / 1024;

  return `${gb.toFixed(
    gb >= 10
      ? 0
      : 1
  )} GB`;
}