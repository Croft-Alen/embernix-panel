"use client";

import Link from "next/link";

import {
  CheckCircle2,
  Clock3,
  GitBranch,
  Loader2,
  XCircle,
} from "lucide-react";

import type {
  Build,
} from "@/features/builds/types";

type BuildCardProps = {
  build: Build;
  siteId: string;
};

export function BuildCard({
  build,
  siteId,
}: BuildCardProps) {
  return (
    <Link
      href={`/websites/${siteId}/builds/${build.id}`}
      className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition-none"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <BuildStatusIcon
              status={build.status}
            />

            <p className="text-sm font-semibold">
              Build #{build.number}
            </p>

            <span
              className={[
                "rounded-full",
                "px-2",
                "py-0.5",
                "text-xs",
                "font-medium",
                getStatusClasses(
                  build.status
                ),
              ].join(" ")}
            >
              {formatStatus(
                build.status
              )}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />

              {build.branch}
            </span>

            <span className="capitalize">
              {build.environment}
            </span>

            {build.commit && (
              <span className="font-mono">
                {build.commit}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-medium">
            {build.durationSeconds
              ? `${build.durationSeconds}s`
              : "—"}
          </p>

          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {formatDate(
              build.startedAt
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

function BuildStatusIcon({
  status,
}: {
  status: Build["status"];
}) {
  if (
    status === "success"
  ) {
    return (
      <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
    );
  }

  if (
    status === "failed"
  ) {
    return (
      <XCircle className="h-4 w-4 text-[var(--danger)]" />
    );
  }

  if (
    status === "building"
  ) {
    return (
      <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
    );
  }

  return (
    <Clock3 className="h-4 w-4 text-[var(--warning)]" />
  );
}

function getStatusClasses(
  status: Build["status"]
) {
  if (
    status === "success"
  ) {
    return "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]";
  }

  if (
    status === "failed"
  ) {
    return "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]";
  }

  if (
    status === "building"
  ) {
    return "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]";
  }

  return "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]";
}

function formatStatus(
  status: Build["status"]
) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
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
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(value)
  );
}