"use client";

import {
  ArrowLeft,
  HelpCircle,
  Search,
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  AnnouncementBanner,
} from "@/components/layout/announcement-banner";

import {
  MobileSidebar,
} from "@/components/layout/mobile-sidebar";

import {
  MobileSidebarTrigger,
} from "@/components/layout/mobile-sidebar-trigger";

import {
  WebsiteSidebar,
} from "@/components/layout/website-sidebar";

import {
  ThemeToggle,
} from "@/components/theme/theme-toggle";

type WebsitePanelShellProps = {
  children: ReactNode;
  siteId: string;
  websiteName: string;
  domain: string;
};

export function WebsitePanelShell({
  children,
  siteId,
  websiteName,
}: WebsitePanelShellProps) {
  const pathname =
    usePathname();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] =
    useState(false);

  useEffect(() => {
    setMobileSidebarOpen(
      false
    );
  }, [pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <WebsiteSidebar
            siteId={
              siteId
            }
          />
        </div>

        <MobileSidebar
          open={
            mobileSidebarOpen
          }
          onClose={() =>
            setMobileSidebarOpen(
              false
            )
          }
        >
          <WebsiteSidebar
            siteId={
              siteId
            }
          />
        </MobileSidebar>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex h-[72px] items-center border-b border-[var(--border)] bg-[var(--background)] px-4 sm:px-6 lg:px-8">
            <div className="flex w-full items-center gap-5">
              <MobileSidebarTrigger
                onClick={() =>
                  setMobileSidebarOpen(
                    true
                  )
                }
              />

              <Link
                href="/websites"
                className="hidden h-10 shrink-0 items-center gap-2 rounded-md px-1 text-sm font-medium text-[var(--muted-foreground)] sm:flex"
              >
                <ArrowLeft className="h-[18px] w-[18px]" />

                <span>
                  Websites
                </span>
              </Link>

              <div className="relative hidden w-full max-w-[520px] md:block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--muted-foreground)]" />

                <input
                  type="search"
                  placeholder={`Search ${websiteName}...`}
                  className="panel-input h-11 w-full !pl-11 !pr-4"
                />
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  className="hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-[var(--muted-foreground)] sm:flex"
                >
                  <HelpCircle className="h-[18px] w-[18px]" />

                  <span>
                    Support
                  </span>
                </button>

                <div className="flex h-10 items-center justify-center">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px] space-y-6">
              <AnnouncementBanner />

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}