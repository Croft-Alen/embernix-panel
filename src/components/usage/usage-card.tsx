import type {
  ReactNode,
} from "react";

type UsageCardProps = {
  icon: ReactNode;

  title: string;

  value: string;

  percentage: number;
};

export function UsageCard({
  icon,
  title,
  value,
  percentage,
}: UsageCardProps) {
  const safePercentage =
    Math.min(
      Math.max(
        percentage,
        0
      ),
      100
    );

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--primary)]">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            {title}
          </p>

          <p className="mt-1 text-lg font-semibold">
            {value}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span>
            Usage
          </span>

          <span>
            {safePercentage.toFixed(
              0
            )}
            %
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
          <div
            className="h-full rounded-full bg-[var(--primary)]"
            style={{
              width:
                `${safePercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}