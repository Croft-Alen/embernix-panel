"use client";

import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  EnvironmentVariable,
} from "@/features/environment/types";

type EnvironmentVariableRowProps = {
  variable: EnvironmentVariable;

  onEdit: (
    variable: EnvironmentVariable
  ) => void;

  onDelete: (
    variable: EnvironmentVariable
  ) => void;
};

export function EnvironmentVariableRow({
  variable,
  onEdit,
  onDelete,
}: EnvironmentVariableRowProps) {
  const [
    visible,
    setVisible,
  ] =
    useState(false);

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  return (
    <div className="grid grid-cols-[minmax(180px,1.1fr)_minmax(220px,1.5fr)_150px_90px] items-center gap-4 border-b border-[var(--border)] px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <span className="truncate font-mono text-sm font-medium">
          {variable.key}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-[var(--muted-foreground)]">
          {visible
            ? variable.value
            : "••••••••••••••••••••"}
        </span>

        <button
          type="button"
          onClick={() =>
            setVisible(
              !visible
            )
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)]"
          aria-label={
            visible
              ? "Hide value"
              : "Reveal value"
          }
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      <div>
        <TargetBadge
          target={
            variable.target
          }
        />
      </div>

      <div className="flex justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)]"
            aria-label="Variable actions"
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
                <ActionItem
                  icon={
                    <Pencil className="h-4 w-4" />
                  }
                  label="Edit"
                  onClick={() => {
                    setMenuOpen(
                      false
                    );

                    onEdit(
                      variable
                    );
                  }}
                />

                <div className="my-1 h-px bg-[var(--border)]" />

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
                      variable
                    );
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TargetBadge({
  target,
}: {
  target:
    EnvironmentVariable["target"];
}) {
  const label =
    target ===
    "production"
      ? "Production"
      : target ===
          "preview"
        ? "Preview"
        : "Both";

  return (
    <span className="inline-flex rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
      {label}
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