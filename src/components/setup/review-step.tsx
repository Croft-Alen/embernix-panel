"use client";

import {
  Braces,
  CheckCircle2,
  Folder,
  TerminalSquare,
} from "lucide-react";

import type {
  DetectedProject,
} from "@/features/setup/types";

type ReviewStepProps = {
  project:
    DetectedProject;
};

export function ReviewStep({
  project,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          Review Configuration
        </h2>

        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Review the project configuration Embernix will use for your first deployment.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-[color-mix(in_srgb,var(--success)_8%,transparent)] p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />

        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Configuration ready
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            Your project is ready for its first build and deployment.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReviewItem
          icon={
            <Braces className="h-4 w-4" />
          }
          label="Framework"
          value={
            project.frameworkLabel
          }
        />

        <ReviewItem
          icon={
            <TerminalSquare className="h-4 w-4" />
          }
          label="Install Command"
          value={
            project.installCommand ||
            "None"
          }
        />

        <ReviewItem
          icon={
            <TerminalSquare className="h-4 w-4" />
          }
          label="Build Command"
          value={
            project.buildCommand ||
            "None"
          }
        />

        <ReviewItem
          icon={
            <Folder className="h-4 w-4" />
          }
          label="Output Directory"
          value={
            project.outputDirectory ||
            "Not set"
          }
        />
      </div>

      <p className="text-xs leading-5 text-[var(--muted-foreground)]">
        You can change build configuration later from Website Settings.
      </p>
    </div>
  );
}

function ReviewItem({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        {icon}

        <span>
          {label}
        </span>
      </div>

      <p className="mt-3 break-all font-mono text-sm font-medium text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}