import {
  FileCode2,
  Hammer,
  Rocket,
} from "lucide-react";

import Button from "@/components/ui/Button";

type EmptyDeploymentsProps = {
  siteId: string;
  setupRequired?: boolean;
};

export function EmptyDeployments({
  siteId,
  setupRequired = false,
}: EmptyDeploymentsProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
          <Rocket className="h-7 w-7" />
        </div>

        <h2 className="mt-5 font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold text-[var(--foreground)]">
          No deployments yet
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
          {setupRequired
            ? "This website has not been deployed yet. Upload your project, configure the build settings, and create the first successful deployment."
            : "Deployments for this website will appear here after a deployment has been created."}
        </p>

        {setupRequired && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button
              href={`/websites/${siteId}/files`}
              icon={
                <FileCode2 className="h-4 w-4" />
              }
            >
              Manage Files
            </Button>

            <Button
              href={`/websites/${siteId}/builds`}
              variant="secondary"
              icon={
                <Hammer className="h-4 w-4" />
              }
            >
              View Builds
            </Button>
          </div>
        )}

        {setupRequired && (
          <p className="mt-5 max-w-md text-xs leading-5 text-[var(--muted-foreground)]">
            The first successful deployment will complete the website setup automatically.
          </p>
        )}
      </div>
    </div>
  );
}