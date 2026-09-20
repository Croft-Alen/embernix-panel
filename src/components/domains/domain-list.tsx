"use client";

import {
  Plus,
} from "lucide-react";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  AddDomainModal,
} from "@/components/domains/add-domain-modal";

import {
  DomainCard,
} from "@/components/domains/domain-card";

import type {
  WebsiteDomain,
} from "@/features/domains/types";

type DomainListProps = {
  initialDomains:
    WebsiteDomain[];

  websiteId: string;
};

export function DomainList({
  initialDomains,
  websiteId,
}: DomainListProps) {
  const [
    domains,
    setDomains,
  ] =
    useState<
      WebsiteDomain[]
    >(
      initialDomains
    );

  const [
    addOpen,
    setAddOpen,
  ] =
    useState(false);

  function handleAddDomain(
    hostname: string
  ) {
    const exists =
      domains.some(
        (
          domain
        ) =>
          domain.hostname.toLowerCase() ===
          hostname.toLowerCase()
      );

    if (exists) {
      return;
    }

    const newDomain:
      WebsiteDomain =
      {
        id:
          `domain-${crypto.randomUUID()}`,

        websiteId,

        hostname,

        type:
          "custom",

        primary:
          false,

        status:
          "pending",

        sslStatus:
          "pending",

        createdAt:
          new Date().toISOString(),

        dnsRecords: [
          {
            id:
              `dns-${crypto.randomUUID()}`,

            type:
              "CNAME",

            name:
              getDNSName(
                hostname
              ),

            value:
              "edge.embernix.site",

            status:
              "pending",
          },
        ],
      };

    setDomains(
      (
        previous
      ) => [
        ...previous,
        newDomain,
      ]
    );

    setAddOpen(
      false
    );
  }

  function handleSetPrimary(
    selected:
      WebsiteDomain
  ) {
    setDomains(
      (
        previous
      ) =>
        previous.map(
          (
            domain
          ) => ({
            ...domain,

            primary:
              domain.id ===
              selected.id,
          })
        )
    );
  }

  function handleCheckDNS(
    selected:
      WebsiteDomain
  ) {
    setDomains(
      (
        previous
      ) =>
        previous.map(
          (
            domain
          ) => {
            if (
              domain.id !==
              selected.id
            ) {
              return domain;
            }

            return {
              ...domain,

              status:
                "connected",

              sslStatus:
                "active",

              dnsRecords:
                domain.dnsRecords?.map(
                  (
                    record
                  ) => ({
                    ...record,

                    status:
                      "valid",
                  })
                ),
            };
          }
        )
    );
  }

  function handleRemove(
    selected:
      WebsiteDomain
  ) {
    setDomains(
      (
        previous
      ) =>
        previous.filter(
          (
            domain
          ) =>
            domain.id !==
            selected.id
        )
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            icon={
              <Plus className="h-4 w-4" />
            }
            onClick={() =>
              setAddOpen(
                true
              )
            }
          >
            Add Domain
          </Button>
        </div>

        {domains.length >
        0 ? (
          <div className="space-y-3">
            {domains.map(
              (
                domain
              ) => (
                <DomainCard
                  key={
                    domain.id
                  }
                  domain={
                    domain
                  }
                  onSetPrimary={
                    handleSetPrimary
                  }
                  onCheckDNS={
                    handleCheckDNS
                  }
                  onRemove={
                    handleRemove
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
            <h2 className="text-sm font-semibold">
              No domains connected
            </h2>

            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Add a custom domain
              to connect it to
              this website.
            </p>
          </div>
        )}
      </div>

      <AddDomainModal
        open={
          addOpen
        }
        onClose={() =>
          setAddOpen(
            false
          )
        }
        onAdd={
          handleAddDomain
        }
      />
    </>
  );
}

function getDNSName(
  hostname: string
) {
  const parts =
    hostname.split(
      "."
    );

  if (
    parts.length <=
    2
  ) {
    return "@";
  }

  return parts[
    0
  ];
}