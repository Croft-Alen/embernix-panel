import {
  Globe2,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  DomainList,
} from "@/components/domains/domain-list";

import {
  mockDomains,
} from "@/features/domains/mock-domains";

import type {
  WebsiteDomain,
} from "@/features/domains/types";

type DomainsPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

const websites = [
  {
    id: "site_01",
    hostname:
      "croft-studio.embernix.site",
  },

  {
    id: "site_02",
    hostname:
      "copycats-printing.embernix.site",
  },

  {
    id: "site_03",
    hostname:
      "nova-portfolio.embernix.site",
  },

  {
    id: "site_04",
    hostname:
      "ember-demo.embernix.site",
  },
];

function createDefaultDomain(
  siteId: string,
  hostname: string
): WebsiteDomain {
  return {
    id: `embernix-${siteId}`,

    websiteId:
      siteId,

    hostname,

    type:
      "embernix",

    primary:
      true,

    status:
      "connected",

    sslStatus:
      "active",

    createdAt:
      new Date().toISOString(),
  };
}

export default async function DomainsPage({
  params,
}: DomainsPageProps) {
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

  const existingDomains =
    mockDomains.filter(
      (
        domain
      ) =>
        domain.websiteId ===
        siteId
    );

  const hasEmbernixDomain =
    existingDomains.some(
      (
        domain
      ) =>
        domain.type ===
        "embernix"
    );

  const domains =
    hasEmbernixDomain
      ? existingDomains
      : [
          createDefaultDomain(
            siteId,
            website.hostname
          ),
          ...existingDomains,
        ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Domains
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Connect and manage domains for this website.
        </p>
      </div>

      <DomainList
        initialDomains={
          domains
        }
        websiteId={
          siteId
        }
      />
    </div>
  );
}