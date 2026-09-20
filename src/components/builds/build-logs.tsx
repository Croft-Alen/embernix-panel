"use client";

import {
  Check,
  Copy,
} from "lucide-react";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import type {
  BuildLogLine,
} from "@/features/builds/types";

type BuildLogsProps = {
  logs: BuildLogLine[];
};

export function BuildLogs({
  logs,
}: BuildLogsProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function copyLogs() {
    const value =
      logs
        .map(
          (log) =>
            `[${formatTime(
              log.timestamp
            )}] ${log.message}`
        )
        .join("\n");

    await navigator.clipboard.writeText(
      value
    );

    setCopied(true);

    window.setTimeout(
      () =>
        setCopied(
          false
        ),
      1500
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">
            Build Logs
          </h3>

          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            Output generated during the build.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={
            copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )
          }
          onClick={
            copyLogs
          }
        >
          {copied
            ? "Copied"
            : "Copy"}
        </Button>
      </div>

      <div className="max-h-[520px] overflow-auto bg-[#09090d]">
        <div className="min-w-[650px] p-4 font-mono text-xs leading-6">
          {logs.map(
            (log) => (
              <div
                key={
                  log.id
                }
                className="flex gap-4"
              >
                <span className="shrink-0 text-zinc-600">
                  {formatTime(
                    log.timestamp
                  )}
                </span>

                <span
                  className={getLogClass(
                    log.type
                  )}
                >
                  {log.message}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function getLogClass(
  type?: BuildLogLine["type"]
) {
  if (
    type === "success"
  ) {
    return "text-emerald-400";
  }

  if (
    type === "error"
  ) {
    return "text-red-400";
  }

  if (
    type === "warning"
  ) {
    return "text-amber-400";
  }

  return "text-zinc-300";
}

function formatTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  ).format(
    new Date(value)
  );
}