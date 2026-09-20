"use client";

import {
  Braces,
  Clock3,
  ExternalLink,
  HardDrive,
} from "lucide-react";

import Button from "@/components/ui/Button";

import type {
  SetupProgressStatus,
} from "@/features/setup/types";

import type {
  DashboardWebsite,
  WebsiteOperationalStatus,
} from "@/features/websites/types";

type WebsiteCardProps = {
  website: DashboardWebsite;
};

export function WebsiteCard({
  website,
}: WebsiteCardProps) {
  const setupStatus =
    website.setupStatus;

  const setupCompleted =
    setupStatus ===
    "completed";

  const setupStarted =
    setupStatus ===
    "in_progress";

  const actionHref =
    setupCompleted
      ? `/websites/${website.id}`
      : `/websites/${website.id}/setup`;

  const actionLabel =
    setupCompleted
      ? "Manage"
      : setupStarted
        ? "Resume Setup"
        : "Set Up Website";

  const framework =
    website.framework ??
    "Not detected";

  const published =
    setupCompleted
      ? website.publishedAt ??
        "Not published yet"
      : "Never";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate font-[family-name:var(--font-plus-jakarta)] text-base font-semibold tracking-tight text-[var(--foreground)]">
              {website.name}
            </h2>

            <p className="mt-1 truncate text-sm text-[var(--muted-foreground)]">
              {website.domain}
            </p>
          </div>

          <WebsiteStatusBadge
            setupStatus={
              setupStatus
            }
            operationalStatus={
              website.status
            }
          />
        </div>

        <div className="grid gap-4 border-y border-[var(--border)] py-4 sm:grid-cols-3">
          <Metric
            icon={
              <Braces className="h-4 w-4" />
            }
            label="Framework"
            value={
              framework
            }
          />

          <Metric
            icon={
              <HardDrive className="h-4 w-4" />
            }
            label="Storage"
            value={
              website.storage
            }
          />

          <Metric
            icon={
              <Clock3 className="h-4 w-4" />
            }
            label="Published"
            value={
              published
            }
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            href={
              actionHref
            }
            size="sm"
          >
            {actionLabel}
          </Button>

          {setupCompleted &&
            website.publicUrl &&
            website.status !==
              "suspended" && (
              <a
                href={
                  website.publicUrl
                }
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${website.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        {icon}

        <span>
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-medium text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function WebsiteStatusBadge({
  setupStatus,
  operationalStatus,
}: {
  setupStatus:
    SetupProgressStatus;

  operationalStatus:
    WebsiteOperationalStatus;
}) {
  if (
    setupStatus ===
    "not_started"
  ) {
    return (
      <StatusBadge
        label="Setup Required"
        classes="bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"
      />
    );
  }

  if (
    setupStatus ===
    "in_progress"
  ) {
    return (
      <StatusBadge
        label="Setup In Progress"
        classes="bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]"
      />
    );
  }

  if (
    operationalStatus ===
    "online"
  ) {
    return (
      <StatusBadge
        label="Online"
        classes="bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]"
      />
    );
  }

  if (
    operationalStatus ===
    "building"
  ) {
    return (
      <StatusBadge
        label="Building"
        classes="bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]"
      />
    );
  }

  if (
    operationalStatus ===
    "failed"
  ) {
    return (
      <StatusBadge
        label="Failed"
        classes="bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]"
      />
    );
  }

  if (
    operationalStatus ===
    "suspended"
  ) {
    return (
      <StatusBadge
        label="Suspended"
        classes="bg-[var(--surface-strong)] text-[var(--muted-foreground)]"
      />
    );
  }

  return (
    <StatusBadge
      label="Offline"
      classes="bg-[var(--surface-strong)] text-[var(--muted-foreground)]"
    />
  );
}

function StatusBadge({
  label,
  classes,
}: {
  label: string;
  classes: string;
}) {
  return (
    <span
      className={[
        "inline-flex",
        "shrink-0",
        "items-center",
        "rounded-full",
        "px-2.5",
        "py-1",
        "text-xs",
        "font-medium",
        classes,
      ].join(" ")}
    >
      {label}
    </span>
  );
}