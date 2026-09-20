"use client";

import {
  HelpCircle,
  Search,
} from "lucide-react";

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
  GlobalSidebar,
} from "@/components/layout/global-sidebar";

import {
  MobileSidebar,
} from "@/components/layout/mobile-sidebar";

import {
  MobileSidebarTrigger,
} from "@/components/layout/mobile-sidebar-trigger";

import {
  ThemeToggle,
} from "@/components/theme/theme-toggle";

type PanelShellProps = {
  children: ReactNode;
};

export function PanelShell({
  children,
}: PanelShellProps) {
  const pathname =
    usePathname();

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] =
    useState(false);

  const isWebsiteRoot =
    pathname === "/websites";

  const isAccountArea =
    pathname === "/account" ||
    pathname.startsWith(
      "/account/"
    );

  const usesGlobalSidebar =
    isWebsiteRoot ||
    isAccountArea;

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

  if (!usesGlobalSidebar) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen">
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <GlobalSidebar />
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
          <GlobalSidebar />
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

              <div className="relative hidden w-full max-w-[520px] sm:block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--muted-foreground)]" />

                <input
                  type="search"
                  placeholder="Search websites or pages..."
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
              {pathname !== "/websites" && (
                <AnnouncementBanner />
              )}

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}