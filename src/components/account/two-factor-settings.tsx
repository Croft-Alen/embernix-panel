"use client";

import {
  ShieldCheck,
} from "lucide-react";
import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

export function TwoFactorSettings() {
  const [
    enabled,
    setEnabled,
  ] =
    useState(false);

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--surface-strong)] text-[var(--primary)]">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Two-Factor Authentication
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              {enabled
                ? "Two-step verification is enabled for this mock account."
                : "You do not currently have two-step verification enabled. Add an additional layer of protection to your account."}
            </p>
          </div>
        </div>

        <Button
          variant={
            enabled
              ? "danger"
              : "secondary"
          }
          onClick={() =>
            setEnabled(
              !enabled
            )
          }
        >
          {enabled
            ? "Disable Two-Factor"
            : "Enable Two-Factor"}
        </Button>
      </div>
    </section>
  );
}