"use client";

import type { ReactNode } from "react";

type ChoiceCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};

export default function ChoiceCard({
  title,
  description,
  icon,
  selected = false,
  disabled = false,
  onClick,
  children,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full",
        "rounded-lg",
        "border",
        "p-4",
        "text-left",
        "transition-none",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        selected
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,var(--surface))]"
          : "border-[var(--border)] bg-[var(--surface)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={[
              "flex",
              "h-10",
              "w-10",
              "shrink-0",
              "items-center",
              "justify-center",
              "rounded-lg",
              "border",
              selected
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--muted-foreground)]",
            ].join(" ")}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-[family-name:var(--font-plus-jakarta)] text-sm font-semibold">
              {title}
            </h3>

            <span
              className={[
                "flex",
                "h-4",
                "w-4",
                "shrink-0",
                "items-center",
                "justify-center",
                "rounded-full",
                "border",
                selected
                  ? "border-[var(--primary)]"
                  : "border-[var(--border-strong)]",
              ].join(" ")}
            >
              {selected && (
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
              )}
            </span>
          </div>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              {description}
            </p>
          )}

          {children}
        </div>
      </div>
    </button>
  );
}