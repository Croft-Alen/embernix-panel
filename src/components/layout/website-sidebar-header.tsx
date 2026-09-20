"use client";

import Link from "next/link";

export function WebsiteSidebarHeader() {
  return (
    <div className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-5">
      <Link
        href="/websites"
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white">
          E
        </div>

        <span className="font-[family-name:var(--font-plus-jakarta)] text-base font-semibold tracking-tight text-[var(--foreground)]">
          Embernix
        </span>
      </Link>
    </div>
  );
}