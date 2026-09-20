"use client";

import Link from "next/link";
import {
  Globe2,
  UserRound,
} from "lucide-react";
import {
  usePathname,
} from "next/navigation";

import {
  SidebarAccount,
} from "@/components/layout/sidebar-account";

const navigation = [
  {
    label: "Websites",
    href: "/websites",
    icon: Globe2,
  },
  {
    label: "Account",
    href: "/account",
    icon: UserRound,
  },
];

export function GlobalSidebar() {
  const pathname =
    usePathname();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
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

      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navigation.map(
            ({
              label,
              href,
              icon: Icon,
            }) => {
              const active =
                href ===
                "/websites"
                  ? pathname ===
                    "/websites"
                  : pathname ===
                      href ||
                    pathname.startsWith(
                      `${href}/`
                    );

              return (
                <Link
                  key={
                    href
                  }
                  href={
                    href
                  }
                  className={[
                    "flex",
                    "h-10",
                    "items-center",
                    "gap-3",
                    "rounded-md",
                    "px-3",
                    "text-sm",
                    "font-medium",
                    "transition-none",

                    active
                      ? "bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]",
                  ].join(
                    " "
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />

                  <span>
                    {label}
                  </span>
                </Link>
              );
            }
          )}
        </div>
      </nav>

      <SidebarAccount />
    </aside>
  );
}