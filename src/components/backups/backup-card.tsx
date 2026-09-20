"use client";

import {
  CheckCircle2,
  Clock3,
  Download,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import type {
  Backup,
} from "@/features/backups/types";

type BackupCardProps = {
  backup: Backup;

  onRestore: (
    backup: Backup
  ) => void;

  onDelete: (
    backup: Backup
  ) => void;

  onDownload: (
    backup: Backup
  ) => void;
};

export function BackupCard({
  backup,
  onRestore,
  onDelete,
  onDownload,
}: BackupCardProps) {
  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <BackupStatusIcon
              status={
                backup.status
              }
            />

            <h2 className="text-sm font-semibold">
              Backup #
              {
                backup.number
              }
            </h2>

            <BackupStatusBadge
              status={
                backup.status
              }
            />
          </div>

          {backup.name && (
            <p className="mt-2 text-sm text-[var(--foreground)]">
              {
                backup.name
              }
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--muted-foreground)]">
            <span className="capitalize">
              {
                backup.type
              }
            </span>

            <span>
              {formatBytes(
                backup.sizeBytes
              )}
            </span>

            <span>
              {formatDate(
                backup.createdAt
              )}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {backup.status ===
            "completed" && (
            <Button
              variant="secondary"
              size="sm"
              icon={
                <Download className="h-4 w-4" />
              }
              onClick={() =>
                onDownload(
                  backup
                )
              }
            >
              Download
            </Button>
          )}

          <div className="relative">
            <button
              type="button"
              aria-label="Backup actions"
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                />

                <div className="absolute right-0 top-9 z-30 min-w-40 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                  {backup.status ===
                    "completed" && (
                    <ActionItem
                      icon={
                        <RotateCcw className="h-4 w-4" />
                      }
                      label="Restore"
                      onClick={() => {
                        setMenuOpen(
                          false
                        );

                        onRestore(
                          backup
                        );
                      }}
                    />
                  )}

                  <ActionItem
                    icon={
                      <Trash2 className="h-4 w-4" />
                    }
                    label="Delete"
                    danger
                    onClick={() => {
                      setMenuOpen(
                        false
                      );

                      onDelete(
                        backup
                      );
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BackupStatusIcon({
  status,
}: {
  status:
    Backup["status"];
}) {
  if (
    status ===
    "completed"
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

  return (
    <Clock3 className="h-4 w-4 text-[var(--warning)]" />
  );
}

function BackupStatusBadge({
  status,
}: {
  status:
    Backup["status"];
}) {
  const classes =
    status ===
    "completed"
      ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]"
      : status ===
          "failed"
        ? "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]"
        : "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]";

  return (
    <span
      className={[
        "rounded-full",
        "px-2",
        "py-0.5",
        "text-xs",
        "font-medium",
        "capitalize",
        classes,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function ActionItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon:
    React.ReactNode;

  label: string;

  danger?: boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "flex",
        "w-full",
        "items-center",
        "gap-2",
        "rounded-md",
        "px-3",
        "py-2",
        "text-left",
        "text-sm",

        danger
          ? "text-[var(--danger)]"
          : "text-[var(--foreground)]",
      ].join(" ")}
    >
      {icon}

      {label}
    </button>
  );
}

function formatBytes(
  bytes?: number
) {
  if (
    bytes ===
    undefined
  ) {
    return "—";
  }

  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  const kb =
    bytes / 1024;

  if (
    kb < 1024
  ) {
    return `${kb.toFixed(
      1
    )} KB`;
  }

  const mb =
    kb / 1024;

  if (
    mb < 1024
  ) {
    return `${mb.toFixed(
      1
    )} MB`;
  }

  return `${(
    mb / 1024
  ).toFixed(1)} GB`;
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