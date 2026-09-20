import {
  Rocket,
  ScrollText,
  Settings2,
} from "lucide-react";

import Button from "@/components/ui/Button";

type EmptyRuntimeLogsProps = {
  siteId: string;
  setupRequired?: boolean;
};

export function EmptyRuntimeLogs({
  siteId,
  setupRequired = false,
}: EmptyRuntimeLogsProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
          <ScrollText className="h-7 w-7" />
        </div>

        <h2 className="mt-5 font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold text-[var(--foreground)]">
          No runtime logs yet
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
          {setupRequired
            ? "Runtime logs will appear after your website has been deployed and starts receiving requests or generating application events."
            : "This website does not have any runtime logs yet."}
        </p>

        {setupRequired && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button
              href={`/websites/${siteId}/setup`}
              icon={
                <Settings2 className="h-4 w-4" />
              }
            >
              Resume Setup
            </Button>

            <Button
              href={`/websites/${siteId}/deployments`}
              variant="secondary"
              icon={
                <Rocket className="h-4 w-4" />
              }
            >
              View Deployments
            </Button>
          </div>
        )}

        {setupRequired && (
          <p className="mt-5 max-w-md text-xs leading-5 text-[var(--muted-foreground)]">
            Build logs are shown separately inside each build. This page is only for runtime and application logs.
          </p>
        )}
      </div>
    </div>
  );
}