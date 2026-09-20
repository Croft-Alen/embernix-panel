import {
  Bug,
  CircleAlert,
  CircleX,
  Info,
} from "lucide-react";

import type {
  RuntimeLog,
} from "@/features/logs/types";

type LogRowProps = {
  log: RuntimeLog;
};

export function LogRow({
  log,
}: LogRowProps) {
  return (
    <div className="grid grid-cols-[90px_90px_120px_minmax(160px,0.8fr)_minmax(260px,1.5fr)_140px] items-center gap-4 border-b border-[var(--border)] px-4 py-3 last:border-b-0">
      <span className="font-mono text-xs text-[var(--muted-foreground)]">
        {formatTime(
          log.timestamp
        )}
      </span>

      <div>
        <LevelBadge
          level={
            log.level
          }
        />
      </div>

      <span className="truncate text-xs capitalize text-[var(--muted-foreground)]">
        {log.environment}
      </span>

      <span className="truncate font-mono text-xs text-[var(--foreground)]">
        {log.source}
      </span>

      <span className="truncate text-sm">
        {log.message}
      </span>

      <span className="truncate text-right font-mono text-xs text-[var(--muted-foreground)]">
        {log.metadata ??
          "—"}
      </span>
    </div>
  );
}

function LevelBadge({
  level,
}: {
  level:
    RuntimeLog["level"];
}) {
  if (
    level === "error"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--danger)]">
        <CircleX className="h-3.5 w-3.5" />

        Error
      </span>
    );
  }

  if (
    level ===
    "warning"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--warning)]">
        <CircleAlert className="h-3.5 w-3.5" />

        Warning
      </span>
    );
  }

  if (
    level === "debug"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
        <Bug className="h-3.5 w-3.5" />

        Debug
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)]">
      <Info className="h-3.5 w-3.5" />

      Info
    </span>
  );
}

function formatTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
      second:
        "2-digit",
      hour12:
        false,
    }
  ).format(
    new Date(value)
  );
}