import {
  Activity,
  Rocket,
} from "lucide-react";

import Button from "@/components/ui/Button";

import type {
  DailyUsage,
} from "@/features/usage/types";

type UsageTableProps = {
  daily: DailyUsage[];
  setupRequired?: boolean;
};

export function UsageTable({
  daily,
  setupRequired = false,
}: UsageTableProps) {
  if (
    daily.length ===
    0
  ) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
            <Activity className="h-7 w-7" />
          </div>

          <h2 className="mt-5 font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold text-[var(--foreground)]">
            No usage activity yet
          </h2>

          <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
            {setupRequired
              ? "Usage data will start appearing after you upload files, create builds, deploy the website, and begin receiving traffic."
              : "There is no usage activity recorded for this website yet."}
          </p>

          {setupRequired && (
            <Button
              href="deployments"
              className="mt-6"
              icon={
                <Rocket className="h-4 w-4" />
              }
            >
              View Deployments
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold">
          Last 7 Days
        </h2>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Daily bandwidth, requests and build usage.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[150px_minmax(180px,1fr)_minmax(180px,1fr)_160px] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            <div>
              Date
            </div>

            <div>
              Bandwidth
            </div>

            <div>
              Requests
            </div>

            <div>
              Build Minutes
            </div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {daily.map(
              (
                item
              ) => (
                <div
                  key={
                    item.date
                  }
                  className="grid grid-cols-[150px_minmax(180px,1fr)_minmax(180px,1fr)_160px] items-center gap-4 px-5 py-3 text-sm"
                >
                  <span className="font-medium">
                    {formatDate(
                      item.date
                    )}
                  </span>

                  <span className="text-[var(--muted-foreground)]">
                    {formatBytes(
                      item.bandwidthBytes
                    )}
                  </span>

                  <span className="text-[var(--muted-foreground)]">
                    {formatNumber(
                      item.requests
                    )}
                  </span>

                  <span className="text-[var(--muted-foreground)]">
                    {
                      item.buildMinutes
                    }{" "}
                    min
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month:
        "short",
      day:
        "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  );
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

  return `${(
    mb / 1024
  ).toFixed(1)} GB`;
}