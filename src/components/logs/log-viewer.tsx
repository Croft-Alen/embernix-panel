"use client";

import {
  Check,
  Copy,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  LogFilters,
} from "@/components/logs/log-filters";

import type {
  EnvironmentFilter,
  LevelFilter,
} from "@/components/logs/log-filters";

import {
  LogRow,
} from "@/components/logs/log-row";

import type {
  RuntimeLog,
} from "@/features/logs/types";

type LogViewerProps = {
  initialLogs:
    RuntimeLog[];
};

export function LogViewer({
  initialLogs,
}: LogViewerProps) {
  const [
    logs,
    setLogs,
  ] =
    useState<
      RuntimeLog[]
    >(
      initialLogs
    );

  const [
    environment,
    setEnvironment,
  ] =
    useState<EnvironmentFilter>(
      "all"
    );

  const [
    level,
    setLevel,
  ] =
    useState<LevelFilter>(
      "all"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    autoScroll,
    setAutoScroll,
  ] =
    useState(true);

  const [
    copied,
    setCopied,
  ] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const filteredLogs =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return logs.filter(
          (
            log
          ) => {
            const environmentMatches =
              environment ===
                "all" ||
              log.environment ===
                environment;

            const levelMatches =
              level ===
                "all" ||
              log.level ===
                level;

            const searchMatches =
              !query ||
              log.message
                .toLowerCase()
                .includes(
                  query
                ) ||
              log.source
                .toLowerCase()
                .includes(
                  query
                ) ||
              (
                log.metadata ??
                ""
              )
                .toLowerCase()
                .includes(
                  query
                );

            return (
              environmentMatches &&
              levelMatches &&
              searchMatches
            );
          }
        );
      },
      [
        logs,
        environment,
        level,
        search,
      ]
    );

  useEffect(() => {
    if (
      !autoScroll
    ) {
      return;
    }

    bottomRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
      }
    );
  }, [
    filteredLogs,
    autoScroll,
  ]);

  async function copyVisibleLogs() {
    const content =
      filteredLogs
        .map(
          (
            log
          ) =>
            `${formatDateTime(
              log.timestamp
            )} [${log.level.toUpperCase()}] [${log.environment}] ${log.source} ${log.message}${
              log.metadata
                ? ` ${log.metadata}`
                : ""
            }`
        )
        .join(
          "\n"
        );

    if (
      !content
    ) {
      return;
    }

    await navigator.clipboard.writeText(
      content
    );

    setCopied(
      true
    );

    window.setTimeout(
      () =>
        setCopied(
          false
        ),
      1500
    );
  }

  function clearView() {
    setLogs([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <LogFilters
            environment={
              environment
            }
            level={
              level
            }
            search={
              search
            }
            autoScroll={
              autoScroll
            }
            onEnvironmentChange={
              setEnvironment
            }
            onLevelChange={
              setLevel
            }
            onSearchChange={
              setSearch
            }
            onAutoScrollChange={
              setAutoScroll
            }
          />
        </div>

        <div className="flex shrink-0 gap-2">
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
            disabled={
              filteredLogs.length ===
              0
            }
            onClick={
              copyVisibleLogs
            }
          >
            {copied
              ? "Copied"
              : "Copy"}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={
              <Trash2 className="h-4 w-4" />
            }
            disabled={
              logs.length ===
              0
            }
            onClick={
              clearView
            }
          >
            Clear View
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-[90px_90px_120px_minmax(160px,0.8fr)_minmax(260px,1.5fr)_140px] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              <div>
                Time
              </div>

              <div>
                Level
              </div>

              <div>
                Environment
              </div>

              <div>
                Source
              </div>

              <div>
                Message
              </div>

              <div className="text-right">
                Details
              </div>
            </div>

            <div className="max-h-[620px] overflow-y-auto">
              {filteredLogs.length >
              0 ? (
                <>
                  {filteredLogs.map(
                    (
                      log
                    ) => (
                      <LogRow
                        key={
                          log.id
                        }
                        log={
                          log
                        }
                      />
                    )
                  )}

                  <div
                    ref={
                      bottomRef
                    }
                  />
                </>
              ) : (
                <div className="px-6 py-16 text-center">
                  <h2 className="text-sm font-semibold">
                    No logs found
                  </h2>

                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    No runtime logs match your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      year:
        "numeric",
      month:
        "2-digit",
      day:
        "2-digit",
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