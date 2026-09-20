"use client";

import {
  CheckCircle2,
  Loader2,
  Rocket,
} from "lucide-react";

import type {
  DeploymentStage,
} from "@/features/setup/types";

type DeployStepProps = {
  stage:
    DeploymentStage;

  websiteName:
    string;
};

export function DeployStep({
  stage,
  websiteName,
}: DeployStepProps) {
  if (
    stage === "ready"
  ) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Website deployed successfully
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
          {websiteName} has completed its first Embernix deployment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
      {stage ===
      "idle" ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
          <Rocket className="h-7 w-7" />
        </div>
      ) : (
        <Loader2 className="h-9 w-9 animate-spin text-[var(--primary)]" />
      )}

      <h2 className="mt-5 text-lg font-semibold">
        {stage ===
        "idle"
          ? "Ready to deploy"
          : stage ===
              "preparing"
            ? "Preparing deployment..."
            : stage ===
                "building"
              ? "Building project..."
              : "Deploying to Embernix..."}
      </h2>

      <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
        {stage ===
        "idle"
          ? "Start the first deployment when you're ready."
          : "Keep this page open while Embernix prepares your website."}
      </p>
    </div>
  );
}