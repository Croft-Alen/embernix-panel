import Link from "next/link";

import {
  Clock3,
  ExternalLink,
  GitBranch,
  Globe2,
  Hammer,
  Layers3,
} from "lucide-react";

import {
  DeploymentProgress,
} from "@/components/deployments/deployment-progress";

import type {
  Deployment,
} from "@/features/deployments/types";

type DeploymentDetailsProps = {
  deployment: Deployment;
  siteId: string;
};

export function DeploymentDetails({
  deployment,
  siteId,
}: DeploymentDetailsProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-semibold">
                Deployment #
                {deployment.number}
              </h1>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Deployment details
                and publishing
                status.
              </p>
            </div>

            <DeploymentStatusBadge
              status={
                deployment.status
              }
            />
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <DetailCard
            icon={
              <Layers3 className="h-4 w-4" />
            }
            label="Environment"
            value={
              deployment.environment
            }
          />

          <DetailCard
            icon={
              <GitBranch className="h-4 w-4" />
            }
            label="Branch"
            value={
              deployment.branch
            }
          />

          <DetailCard
            icon={
              <Clock3 className="h-4 w-4" />
            }
            label="Created"
            value={formatDate(
              deployment.createdAt
            )}
          />

          <DetailCard
            icon={
              <Clock3 className="h-4 w-4" />
            }
            label="Duration"
            value={
              deployment.durationSeconds
                ? `${deployment.durationSeconds}s`
                : "Running"
            }
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold">
              Deployment Progress
            </h2>
          </div>

          <div className="p-5">
            <DeploymentProgress
              steps={
                deployment.steps
              }
            />
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-sm font-semibold">
                Domains
              </h2>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {deployment.domains.map(
                (
                  domain
                ) => (
                  <div
                    key={
                      domain
                    }
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Globe2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />

                      <span className="truncate text-sm font-medium">
                        {domain}
                      </span>
                    </div>

                    <a
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--muted-foreground)]"
                      aria-label={`Open ${domain}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="text-sm font-semibold">
                Source
              </h2>
            </div>

            <div className="space-y-4 p-5">
              <DetailRow
                label="Branch"
                value={
                  deployment.branch
                }
              />

              <DetailRow
                label="Commit"
                value={
                  deployment.commit ??
                  "—"
                }
                mono
              />

              <DetailRow
                label="Environment"
                value={
                  deployment.environment
                }
              />
            </div>
          </section>

          {deployment.buildId &&
            deployment.buildNumber && (
              <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] px-5 py-4">
                  <h2 className="text-sm font-semibold">
                    Build
                  </h2>
                </div>

                <div className="p-5">
                  <Link
                    href={`/websites/${siteId}/builds/${deployment.buildId}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--primary)]">
                      <Hammer className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Build #
                        {
                          deployment.buildNumber
                        }
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        View build details
                      </p>
                    </div>
                  </Link>
                </div>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}

function DetailCard({
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
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-semibold capitalize">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[var(--muted-foreground)]">
        {label}
      </span>

      <span
        className={[
          "text-right",
          "text-sm",
          "font-medium",
          mono
            ? "font-mono"
            : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function DeploymentStatusBadge({
  status,
}: {
  status:
    Deployment["status"];
}) {
  const classes =
    status === "ready"
      ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]"
      : status ===
          "failed"
        ? "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]"
        : status ===
            "deploying"
          ? "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"
          : "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]";

  return (
    <span
      className={[
        "inline-flex",
        "w-fit",
        "rounded-full",
        "px-2.5",
        "py-1",
        "text-xs",
        "font-semibold",
        "capitalize",
        classes,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    }
  ).format(
    new Date(value)
  );
}