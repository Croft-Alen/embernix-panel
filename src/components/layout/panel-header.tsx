import Link from "next/link";

import {
  Bell,
  ChevronDown,
  Globe2,
  HelpCircle,
  LayoutGrid,
} from "lucide-react";

import {
  ThemeToggle,
} from "@/components/theme/theme-toggle";

export function PanelHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/websites"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
              <Globe2 className="h-4 w-4" />
            </div>

            <span className="font-[family-name:var(--font-plus-jakarta)] text-base font-semibold tracking-tight">
              Embernix
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/websites"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--surface-hover)] px-3 text-sm font-medium"
            >
              <LayoutGrid className="h-4 w-4" />

              Websites
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)]"
            aria-label="Help"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)]"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          </button>

          <button
            type="button"
            className="ml-2 flex h-9 items-center gap-2 rounded-md px-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-strong)] text-xs font-semibold">
              Z
            </div>

            <span className="hidden text-sm font-medium sm:inline">
              Zohaib
            </span>

            <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
          </button>
        </div>
      </div>
    </header>
  );
}