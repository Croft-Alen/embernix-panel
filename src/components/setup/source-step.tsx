"use client";

import {
  GitBranch,
  UploadCloud,
} from "lucide-react";

import type {
  SetupSource,
} from "@/features/setup/types";

type SourceStepProps = {
  value?: SetupSource;

  onChange: (
    source: SetupSource
  ) => void;
};

export function SourceStep({
  value,
  onChange,
}: SourceStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">
          Choose your project source
        </h2>

        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Select how you want to provide your website files to Embernix.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SourceCard
          selected={
            value ===
            "upload"
          }
          icon={
            <UploadCloud className="h-5 w-5" />
          }
          title="Upload Project"
          description="Upload your website project directly from your computer."
          onClick={() =>
            onChange(
              "upload"
            )
          }
        />

        <SourceCard
          selected={
            value ===
            "github"
          }
          icon={
            <GitBranch className="h-5 w-5" />
          }
          title="Git Repository"
          description="Connect a Git repository and deploy from your source code."
          onClick={() =>
            onChange(
              "github"
            )
          }
        />
      </div>
    </div>
  );
}

function SourceCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;

  icon: React.ReactNode;

  title: string;

  description: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "flex",
        "min-h-[140px]",
        "items-start",
        "gap-4",
        "rounded-lg",
        "border",
        "p-5",
        "text-left",
        "transition-none",

        selected
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_7%,var(--surface))]"
          : "border-[var(--border)] bg-[var(--surface)]",
      ].join(" ")}
    >
      <div
        className={[
          "flex",
          "h-10",
          "w-10",
          "shrink-0",
          "items-center",
          "justify-center",
          "rounded-md",

          selected
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--surface-strong)] text-[var(--muted-foreground)]",
        ].join(" ")}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>
    </button>
  );
}