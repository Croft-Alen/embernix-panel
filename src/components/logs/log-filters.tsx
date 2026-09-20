"use client";

import {
  Search,
} from "lucide-react";

import type {
  LogEnvironment,
  LogLevel,
} from "@/features/logs/types";

export type EnvironmentFilter =
  | "all"
  | LogEnvironment;

export type LevelFilter =
  | "all"
  | LogLevel;

type LogFiltersProps = {
  environment:
    EnvironmentFilter;

  level:
    LevelFilter;

  search:
    string;

  autoScroll:
    boolean;

  onEnvironmentChange: (
    value:
      EnvironmentFilter
  ) => void;

  onLevelChange: (
    value:
      LevelFilter
  ) => void;

  onSearchChange: (
    value: string
  ) => void;

  onAutoScrollChange: (
    value: boolean
  ) => void;
};

export function LogFilters({
  environment,
  level,
  search,
  autoScroll,
  onEnvironmentChange,
  onLevelChange,
  onSearchChange,
  onAutoScrollChange,
}: LogFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <select
          value={
            environment
          }
          onChange={(
            event
          ) =>
            onEnvironmentChange(
              event.target.value as EnvironmentFilter
            )
          }
          className="panel-select min-w-36"
          aria-label="Environment filter"
        >
          <option value="all">
            All Environments
          </option>

          <option value="production">
            Production
          </option>

          <option value="preview">
            Preview
          </option>
        </select>

        <select
          value={
            level
          }
          onChange={(
            event
          ) =>
            onLevelChange(
              event.target.value as LevelFilter
            )
          }
          className="panel-select min-w-32"
          aria-label="Level filter"
        >
          <option value="all">
            All Levels
          </option>

          <option value="info">
            Info
          </option>

          <option value="warning">
            Warning
          </option>

          <option value="error">
            Error
          </option>

          <option value="debug">
            Debug
          </option>
        </select>

        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--muted-foreground)]">
          <input
            type="checkbox"
            checked={
              autoScroll
            }
            onChange={(
              event
            ) =>
              onAutoScrollChange(
                event.target.checked
              )
            }
            className="h-4 w-4 accent-[var(--primary)]"
          />

          Auto-scroll
        </label>
      </div>

      <div className="relative w-full lg:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />

        <input
          type="text"
          value={
            search
          }
          onChange={(
            event
          ) =>
            onSearchChange(
              event.target.value
            )
          }
          className="panel-input pl-9"
          placeholder="Search logs..."
        />
      </div>
    </div>
  );
}