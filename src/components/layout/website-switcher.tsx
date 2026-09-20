"use client";

import Link from "next/link";
import {
  ChevronDown,
  Globe2,
} from "lucide-react";

type WebsiteSwitcherProps = {
  siteId: string;
  name: string;
  domain: string;
};

export function WebsiteSwitcher({
  siteId,
  name,
  domain,
}: WebsiteSwitcherProps) {
  return (
    <Link
      href="/websites"
      className="flex w-full items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
        <Globe2 className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {name}
        </p>

        <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
          {domain}
        </p>
      </div>

      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
    </Link>
  );
}