import {
  Archive,
  Rocket,
  Settings2,
} from "lucide-react";

import Button from "@/components/ui/Button";

type UnavailableBackupsProps = {
  siteId: string;
};

export function UnavailableBackups({
  siteId,
}: UnavailableBackupsProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
          <Archive className="h-7 w-7" />
        </div>

        <h2 className="mt-5 font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold text-[var(--foreground)]">
          Backups aren&apos;t available yet
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
          Create your first successful deployment before backups can be created or restored for this website.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            href={`/websites/${siteId}/deployments`}
            icon={
              <Rocket className="h-4 w-4" />
            }
          >
            View Deployments
          </Button>

          <Button
            href={`/websites/${siteId}/setup`}
            variant="secondary"
            icon={
              <Settings2 className="h-4 w-4" />
            }
          >
            Resume Setup
          </Button>
        </div>

        <p className="mt-5 max-w-md text-xs leading-5 text-[var(--muted-foreground)]">
          Backups will become available automatically after the first successful deployment.
        </p>
      </div>
    </div>
  );
}