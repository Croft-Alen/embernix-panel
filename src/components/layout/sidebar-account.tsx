"use client";

import Link from "next/link";
import {
  ChevronRight,
} from "lucide-react";

type SidebarAccountProps = {
  name?: string;
  email?: string;
};

export function SidebarAccount({
  name = "Zohaib",
  email = "zohaib@example.com",
}: SidebarAccountProps) {
  const initial =
    name
      .trim()
      .charAt(0)
      .toUpperCase() || "Z";

  return (
    <Link
      href="/account"
      className="group flex w-full items-center gap-3 border-t border-[var(--border)] px-4 py-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-semibold text-white">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {name}
        </p>

        <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
          {email}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
    </Link>
  );
}