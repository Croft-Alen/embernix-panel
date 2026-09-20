import {
  Hammer,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  BuildCard,
} from "@/components/builds/build-card";

import {
  EmptyBuilds,
} from "@/components/builds/empty-builds";

import {
  mockBuilds,
} from "@/features/builds/mock-builds";

type BuildsPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

const websites = [
  {
    id: "site_01",
    setupRequired: false,
  },

  {
    id: "site_02",
    setupRequired: false,
  },

  {
    id: "site_03",
    setupRequired: true,
  },

  {
    id: "site_04",
    setupRequired: true,
  },
];

export default async function BuildsPage({
  params,
}: BuildsPageProps) {
  const {
    siteId,
  } =
    await params;

  const website =
    websites.find(
      (
        item
      ) =>
        item.id ===
        siteId
    );

  if (!website) {
    notFound();
  }

  const builds =
    mockBuilds.filter(
      (
        build
      ) =>
        build.websiteId ===
        siteId
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Hammer className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Builds
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          View builds and build activity for this website.
        </p>
      </div>

      {builds.length >
      0 ? (
        <div className="space-y-3">
          {builds.map(
            (
              build
            ) => (
              <BuildCard
                key={
                  build.id
                }
                build={
                  build
                }
                siteId={
                  siteId
                }
              />
            )
          )}
        </div>
      ) : (
        <EmptyBuilds
          siteId={
            siteId
          }
          setupRequired={
            website.setupRequired
          }
        />
      )}
    </div>
  );
}