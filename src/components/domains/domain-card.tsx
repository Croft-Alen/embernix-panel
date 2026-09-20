"use client";

import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  DNSRecords,
} from "@/components/domains/dns-records";

import type {
  WebsiteDomain,
} from "@/features/domains/types";

type DomainCardProps = {
  domain: WebsiteDomain;

  onSetPrimary: (
    domain: WebsiteDomain
  ) => void;

  onCheckDNS: (
    domain: WebsiteDomain
  ) => void;

  onRemove: (
    domain: WebsiteDomain
  ) => void;
};

export function DomainCard({
  domain,
  onSetPrimary,
  onCheckDNS,
  onRemove,
}: DomainCardProps) {
  const [
    actionsOpen,
    setActionsOpen,
  ] =
    useState(false);

  const [
    dnsOpen,
    setDnsOpen,
  ] =
    useState(
      domain.status ===
        "pending"
    );

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Globe2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />

            <h2 className="truncate text-sm font-semibold">
              {
                domain.hostname
              }
            </h2>

            {domain.primary && (
              <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                Primary
              </span>
            )}

            {domain.type ===
              "embernix" && (
              <span className="rounded-full bg-[var(--surface-strong)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                Embernix
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <DomainStatus
              status={
                domain.status
              }
            />

            <SSLStatus
              status={
                domain.sslStatus
              }
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            href={`https://${domain.hostname}`}
            external
            variant="secondary"
            size="sm"
            icon={
              <ExternalLink className="h-4 w-4" />
            }
          >
            Open
          </Button>

          {domain.dnsRecords &&
            domain.dnsRecords.length >
              0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDnsOpen(
                    !dnsOpen
                  )
                }
              >
                DNS
              </Button>
            )}

          <div className="relative">
            <button
              type="button"
              aria-label="Domain actions"
              onClick={() =>
                setActionsOpen(
                  !actionsOpen
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)]"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {actionsOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={() =>
                    setActionsOpen(
                      false
                    )
                  }
                />

                <div className="absolute right-0 top-9 z-30 min-w-44 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                  {!domain.primary &&
                    domain.type ===
                      "custom" && (
                      <ActionItem
                        icon={
                          <Star className="h-4 w-4" />
                        }
                        label="Set Primary"
                        onClick={() => {
                          setActionsOpen(
                            false
                          );

                          onSetPrimary(
                            domain
                          );
                        }}
                      />
                    )}

                  {domain.type ===
                    "custom" && (
                    <ActionItem
                      icon={
                        <RefreshCw className="h-4 w-4" />
                      }
                      label="Check DNS"
                      onClick={() => {
                        setActionsOpen(
                          false
                        );

                        onCheckDNS(
                          domain
                        );
                      }}
                    />
                  )}

                  {domain.type ===
                    "custom" && (
                    <>
                      <div className="my-1 h-px bg-[var(--border)]" />

                      <ActionItem
                        icon={
                          <Trash2 className="h-4 w-4" />
                        }
                        label="Remove"
                        danger
                        onClick={() => {
                          setActionsOpen(
                            false
                          );

                          onRemove(
                            domain
                          );
                        }}
                      />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {dnsOpen &&
        domain.dnsRecords &&
        domain.dnsRecords.length >
          0 && (
          <div className="border-t border-[var(--border)] p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">
                DNS Records
              </h3>

              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Configure these records
                with your DNS provider.
              </p>
            </div>

            <DNSRecords
              records={
                domain.dnsRecords
              }
            />
          </div>
        )}
    </div>
  );
}

function DomainStatus({
  status,
}: {
  status:
    WebsiteDomain["status"];
}) {
  if (
    status ===
    "connected"
  ) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
        <CheckCircle2 className="h-3.5 w-3.5" />

        Connected
      </span>
    );
  }

  if (
    status === "error"
  ) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--danger)]">
        <XCircle className="h-3.5 w-3.5" />

        Error
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--warning)]">
      <Clock3 className="h-3.5 w-3.5" />

      Pending DNS
    </span>
  );
}

function SSLStatus({
  status,
}: {
  status:
    WebsiteDomain["sslStatus"];
}) {
  if (
    status === "active"
  ) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />

        SSL Active
      </span>
    );
  }

  if (
    status === "error"
  ) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-[var(--danger)]">
        <XCircle className="h-3.5 w-3.5" />

        SSL Error
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
      <Clock3 className="h-3.5 w-3.5 text-[var(--warning)]" />

      SSL Pending
    </span>
  );
}

function ActionItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon:
    React.ReactNode;

  label: string;

  danger?: boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "flex",
        "w-full",
        "items-center",
        "gap-2",
        "rounded-md",
        "px-3",
        "py-2",
        "text-left",
        "text-sm",

        danger
          ? "text-[var(--danger)]"
          : "text-[var(--foreground)]",
      ].join(" ")}
    >
      {icon}

      {label}
    </button>
  );
}