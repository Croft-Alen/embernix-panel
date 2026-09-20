import {
  Hand,
} from "lucide-react";

export function DashboardWelcomeCard() {
  return (
    <div className="flex min-h-[104px] items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 -rotate-12 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
          <Hand className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Welcome back
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Here you can see all the websites you have access to.
          </p>
        </div>
      </div>
    </div>
  );
}