import {
  Activity,
  Braces,
  ExternalLink,
  Globe2,
  HardDrive,
  Rocket,
  Server,
} from "lucide-react";

import Button from "@/components/ui/Button";

type SetupStatus =
  | "not_started"
  | "in_progress"
  | "completed";

type WebsiteOverviewProps = {
  siteId: string;

  name: string;

  domain: string;

  framework?: string;

  setupStatus: SetupStatus;

  storage: string;

  bandwidth: string;

  deploymentStatus:
    | "ready"
    | "building"
    | "failed"
    | "not_deployed";

  publicUrl?: string;
};

export function WebsiteOverview({
  siteId,
  name,
  domain,
  framework,
  setupStatus,
  storage,
  bandwidth,
  deploymentStatus,
  publicUrl,
}: WebsiteOverviewProps) {
  const setupComplete =
    setupStatus ===
    "completed";

  const setupStarted =
    setupStatus ===
    "in_progress";

  const detectedFramework =
    framework ??
    "Not detected";

  return (
    <div className="space-y-6">
      {!setupComplete && (
        <SetupBanner
          siteId={
            siteId
          }
          started={
            setupStarted
          }
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {name}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Globe2 className="h-4 w-4" />

            <span>
              {domain}
            </span>
          </div>
        </div>

        {setupComplete &&
          publicUrl && (
            <Button
              href={
                publicUrl
              }
              external
              variant="secondary"
              icon={
                <ExternalLink className="h-4 w-4" />
              }
            >
              Open Website
            </Button>
          )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          icon={
            <Activity className="h-4 w-4" />
          }
          label="Deployment"
          value={
            setupComplete
              ? getDeploymentLabel(
                  deploymentStatus
                )
              : "Not deployed"
          }
        />

        <OverviewCard
          icon={
            <Braces className="h-4 w-4" />
          }
          label="Framework"
          value={
            detectedFramework
          }
        />

        <OverviewCard
          icon={
            <HardDrive className="h-4 w-4" />
          }
          label="Storage"
          value={
            storage
          }
        />

        <OverviewCard
          icon={
            <Server className="h-4 w-4" />
          }
          label="Bandwidth"
          value={
            bandwidth
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
              <Rocket className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Deployment
              </h2>

              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Current website deployment state.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <p className="text-sm font-medium">
              {setupComplete
                ? "Your website is configured and ready for deployments."
                : "Your website has not completed its first deployment yet."}
            </p>

            {!setupComplete && (
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                You can finish the guided setup or configure the website manually from Files, Environment and Settings.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Website
          </p>

          <div className="mt-4 space-y-4">
            <InfoRow
              label="Status"
              value={
                setupComplete
                  ? "Configured"
                  : setupStarted
                    ? "Setup In Progress"
                    : "Setup Required"
              }
            />

            <InfoRow
              label="Framework"
              value={
                detectedFramework
              }
            />

            <InfoRow
              label="Domain"
              value={
                domain
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupBanner({
  siteId,
  started,
}: {
  siteId: string;
  started: boolean;
}) {
  return (
    <div className="rounded-lg border border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {started
              ? "Website setup is in progress"
              : "Website setup is required"}
          </p>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            {started
              ? "Continue the guided setup, or configure the website manually from Files, Environment and Settings."
              : "Use the guided setup to upload your project and create the first deployment, or configure everything manually."}
          </p>
        </div>

        <Button
          href={`/websites/${siteId}/setup`}
          size="sm"
        >
          {started
            ? "Resume Setup"
            : "Set Up Website"}
        </Button>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
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

      <p className="mt-3 truncate text-sm font-semibold text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[var(--muted-foreground)]">
        {label}
      </span>

      <span className="truncate text-sm font-medium text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

function getDeploymentLabel(
  status:
    | "ready"
    | "building"
    | "failed"
    | "not_deployed"
) {
  if (
    status === "ready"
  ) {
    return "Ready";
  }

  if (
    status === "building"
  ) {
    return "Building";
  }

  if (
    status === "failed"
  ) {
    return "Failed";
  }

  return "Not deployed";
}