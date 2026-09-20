"use client";

import Link from "next/link";
import {
  Activity,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  usePathname,
} from "next/navigation";

const tabs = [
  {
    label: "General",
    href: "/account",
    icon: UserRound,
  },
  {
    label: "Security",
    href: "/account/security",
    icon: ShieldCheck,
  },
  {
    label: "Activity",
    href: "/account/activity",
    icon: Activity,
  },
];

export function AccountTabs() {
  const pathname =
    usePathname();

  return (
    <div className="border-b border-[var(--border)]">
      <nav className="flex gap-1 overflow-x-auto">
        {tabs.map(
          ({
            label,
            href,
            icon: Icon,
          }) => {
            const active =
              href === "/account"
                ? pathname === "/account"
                : pathname.startsWith(
                    href
                  );

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "relative",
                  "flex",
                  "h-11",
                  "shrink-0",
                  "items-center",
                  "gap-2",
                  "px-3",
                  "text-sm",
                  "font-medium",
                  "transition-none",

                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />

                {label}

                {active && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--primary)]" />
                )}
              </Link>
            );
          }
        )}
      </nav>
    </div>
  );
}