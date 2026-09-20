"use client";

import {
  useState,
} from "react";

import {
  AnnouncementBanner,
} from "@/components/layout/announcement-banner";

import {
  DashboardDiscordCard,
} from "@/components/websites/dashboard-discord-card";

import {
  DashboardWelcomeCard,
} from "@/components/websites/dashboard-welcome-card";

import {
  WebsiteCard,
} from "@/components/websites/website-card";

import {
  WebsiteVisibilityToggle,
} from "@/components/websites/website-visibility-toggle";

import type {
  DashboardWebsite,
} from "@/features/websites/types";

type WebsitesDashboardProps = {
  websites:
    DashboardWebsite[];
};

export function WebsitesDashboard({
  websites,
}: WebsitesDashboardProps) {
  const [
    showWebsites,
    setShowWebsites,
  ] =
    useState(true);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <WebsiteVisibilityToggle
          enabled={
            showWebsites
          }
          onChange={
            setShowWebsites
          }
        />
      </div>

      <AnnouncementBanner />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <DashboardWelcomeCard />

        <DashboardDiscordCard />
      </div>

      <section className="space-y-4">
        <div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-semibold tracking-tight">
            Websites
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Manage hosting services provisioned through your Embernix account.
          </p>
        </div>

        {showWebsites ? (
          websites.length >
          0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {websites.map(
                (
                  website
                ) => (
                  <WebsiteCard
                    key={
                      website.id
                    }
                    website={
                      website
                    }
                  />
                )
              )}
            </div>
          ) : (
            <EmptyWebsites />
          )
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
            <h2 className="text-sm font-semibold">
              Websites hidden
            </h2>

            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Turn on website visibility to show your hosting services.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyWebsites() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
      <h2 className="text-sm font-semibold">
        No hosting services yet
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
        Hosting services will appear here automatically after a successful purchase through Embernix Billing.
      </p>
    </div>
  );
}