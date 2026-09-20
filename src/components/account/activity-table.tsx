import {
  Activity,
} from "lucide-react";

import type {
  AccountActivity,
} from "@/features/account/types";

type ActivityTableProps = {
  activities:
    AccountActivity[];
};

export function ActivityTable({
  activities,
}: ActivityTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-start gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--surface-strong)] text-[var(--primary)]">
          <Activity className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-sm font-semibold">
            Account Activity
          </h2>

          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Review recent security and account events.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[minmax(240px,1.5fr)_1fr_1fr] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            <div>
              Event
            </div>

            <div>
              IP Address
            </div>

            <div>
              Time
            </div>
          </div>

          {activities.map(
            (
              activity
            ) => (
              <div
                key={
                  activity.id
                }
                className="grid grid-cols-[minmax(240px,1.5fr)_1fr_1fr] items-center gap-4 border-b border-[var(--border)] px-5 py-3 last:border-b-0"
              >
                <span className="text-sm font-medium">
                  {
                    activity.event
                  }
                </span>

                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  {
                    activity.ipAddress
                  }
                </span>

                <span className="text-sm text-[var(--muted-foreground)]">
                  {formatDate(
                    activity.createdAt
                  )}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
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
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    }
  ).format(
    new Date(value)
  );
}