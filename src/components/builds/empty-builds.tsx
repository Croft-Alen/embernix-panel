import {
  FileCode2,
  Hammer,
  Settings2,
} from "lucide-react";

import Button from "@/components/ui/Button";

type EmptyBuildsProps = {
  siteId: string;
  setupRequired?: boolean;
};

export function EmptyBuilds({
  siteId,
  setupRequired = false,
}: EmptyBuildsProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
          <Hammer className="h-7 w-7" />
        </div>

        <h2 className="mt-5 font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold text-[var(--foreground)]">
          No builds yet
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
          {setupRequired
            ? "This website has not created its first build yet. Upload your project files and configure the build settings before creating a deployment."
            : "Builds for this website will appear here after a build has been created."}
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
              href={`/websites/${siteId}/settings`}
              variant="secondary"
              icon={
                <Settings2 className="h-4 w-4" />
              }
            >
              Build Settings
            </Button>
          </div>
        )}

        {setupRequired && (
          <p className="mt-5 max-w-md text-xs leading-5 text-[var(--muted-foreground)]">
            You can finish the guided setup instead, or configure the website manually from the panel.
          </p>
        )}
      </div>
    </div>
  );
}