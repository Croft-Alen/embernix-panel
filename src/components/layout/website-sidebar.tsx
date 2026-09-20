"use client";

import Link from "next/link";

import {
  Activity,
  Archive,
  Braces,
  CloudUpload,
  Code2,
  FileText,
  Globe2,
  HardDrive,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  WebsiteSidebarAccount,
} from "@/components/layout/website-sidebar-account";

import {
  WebsiteSidebarHeader,
} from "@/components/layout/website-sidebar-header";

type WebsiteSidebarProps = {
  siteId: string;
};

const navigation = [
  {
    label: "Overview",
    segment: "",
    icon: LayoutDashboard,
  },
  {
    label: "Files",
    segment: "files",
    icon: FileText,
  },
  {
    label: "Builds",
    segment: "builds",
    icon: Code2,
  },
  {
    label: "Deployments",
    segment: "deployments",
    icon: CloudUpload,
  },
  {
    label: "Domains",
    segment: "domains",
    icon: Globe2,
  },
  {
    label: "Environment",
    segment: "environment",
    icon: Braces,
  },
  {
    label: "Logs",
    segment: "logs",
    icon: Activity,
  },
  {
    label: "Backups",
    segment: "backups",
    icon: Archive,
  },
  {
    label: "Usage",
    segment: "usage",
    icon: HardDrive,
  },
  {
    label: "Settings",
    segment: "settings",
    icon: Settings,
  },
];

export function WebsiteSidebar({
  siteId,
}: WebsiteSidebarProps) {
  const pathname =
    usePathname();

  const basePath =
    `/websites/${siteId}`;

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <WebsiteSidebarHeader />

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navigation.map(
            ({
              label,
              segment,
              icon: Icon,
            }) => {
              const href =
                segment
                  ? `${basePath}/${segment}`
                  : basePath;

              const active =
                segment === ""
                  ? pathname ===
                    basePath
                  : pathname ===
                      href ||
                    pathname.startsWith(
                      `${href}/`
                    );

              return (
                <Link
                  key={label}
                  href={href}
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
                  ].join(" ")}
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

      <WebsiteSidebarAccount />
    </aside>
  );
}