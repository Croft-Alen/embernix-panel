export function DashboardDiscordCard() {
  return (
    <a
      href="#"
      className="flex min-h-[112px] items-center rounded-lg bg-[color-mix(in_srgb,#5865F2_14%,transparent)] px-6 py-5"
    >
      <div className="flex w-full items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="text-sm text-[var(--muted-foreground)]">
            Community
          </p>

          <h2 className="mt-1 font-[family-name:var(--font-plus-jakarta)] text-lg font-semibold text-[var(--foreground)]">
            Join our Discord
          </h2>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#5865F2] text-white">
          <DiscordIcon className="h-7 w-7" />
        </div>
      </div>
    </a>
  );
}

function DiscordIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19.54 5.34A17.3 17.3 0 0 0 15.36 4a12.4 12.4 0 0 0-.54 1.12 16.3 16.3 0 0 0-4.64 0A11.8 11.8 0 0 0 9.64 4a17.2 17.2 0 0 0-4.2 1.35C2.78 9.32 2.06 13.2 2.42 17.03a17.4 17.4 0 0 0 5.13 2.58c.41-.56.78-1.16 1.1-1.78a11.4 11.4 0 0 1-1.73-.83c.14-.1.28-.21.41-.32a12.4 12.4 0 0 0 10.34 0l.41.32c-.56.33-1.14.61-1.74.83.32.62.69 1.22 1.1 1.78a17.3 17.3 0 0 0 5.14-2.58c.42-4.44-.72-8.28-3.04-11.69ZM8.75 14.7c-1 0-1.82-.92-1.82-2.05s.8-2.05 1.82-2.05c1.02 0 1.84.93 1.82 2.05 0 1.13-.8 2.05-1.82 2.05Zm6.5 0c-1 0-1.82-.92-1.82-2.05s.8-2.05 1.82-2.05c1.02 0 1.84.93 1.82 2.05 0 1.13-.8 2.05-1.82 2.05Z" />
    </svg>
  );
}