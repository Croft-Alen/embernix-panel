"use client";

type WebsiteVisibilityToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function WebsiteVisibilityToggle({
  enabled,
  onChange,
}: WebsiteVisibilityToggleProps) {
  return (
    <div className="flex h-10 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3">
      <span className="whitespace-nowrap text-sm font-medium text-[var(--muted-foreground)]">
        Showing your websites
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle website visibility"
        onClick={() => onChange(!enabled)}
        className={[
          "relative",
          "inline-flex",
          "h-6",
          "w-11",
          "shrink-0",
          "items-center",
          "rounded-full",
          "border",
          "p-1",
          "outline-none",
          "transition-none",

          enabled
            ? "border-[var(--primary)] bg-[var(--primary)]"
            : "border-[var(--border)] bg-[var(--surface-strong)]",
        ].join(" ")}
      >
        <span
          className={[
            "block",
            "h-4",
            "w-4",
            "rounded-full",
            "bg-white",
            "shadow-sm",
            "transition-transform",
            "duration-150",

            enabled
              ? "translate-x-5"
              : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}