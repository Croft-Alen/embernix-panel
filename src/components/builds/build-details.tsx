import {
  CalendarClock,
  GitBranch,
  Layers3,
  Timer,
} from "lucide-react";

import {
  BuildLogs,
} from "@/components/builds/build-logs";

import {
  BuildProgress,
} from "@/components/builds/build-progress";

import type {
  Build,
} from "@/features/builds/types";

type BuildDetailsProps = {
  build: Build;
};

export function BuildDetails({
  build,
}: BuildDetailsProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold">
                Build #{build.number}
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Build details and progress.
              </p>
            </div>

            <BuildStatusBadge
              status={
                build.status
              }
            />
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <DetailCard
            icon={
              <Layers3 className="h-4 w-4" />
            }
            label="Framework"
            value={
              build.framework
            }
          />

          <DetailCard
            icon={
              <GitBranch className="h-4 w-4" />
            }
            label="Branch"
            value={
              build.branch
            }
          />

          <DetailCard
            icon={
              <CalendarClock className="h-4 w-4" />
            }
            label="Started"
            value={formatDate(
              build.startedAt
            )}
          />

          <DetailCard
            icon={
              <Timer className="h-4 w-4" />
            }
            label="Duration"
            value={
              build.durationSeconds
                ? `${build.durationSeconds}s`
                : "Running"
            }
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-sm font-semibold">
              Build Progress
            </h3>
          </div>

          <div className="p-5">
            <BuildProgress
              stages={
                build.stages
              }
            />
          </div>
        </section>

        <BuildLogs
          logs={
            build.logs
          }
        />
      </div>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function BuildStatusBadge({
  status,
}: {
  status: Build["status"];
}) {
  const classes =
    status === "success"
      ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]"
      : status === "failed"
        ? "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]"
        : status === "building"
          ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"
          : "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]";

  return (
    <span
      className={[
        "inline-flex",
        "w-fit",
        "rounded-full",
        "px-2.5",
        "py-1",
        "text-xs",
        "font-semibold",
        "capitalize",
        classes,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}