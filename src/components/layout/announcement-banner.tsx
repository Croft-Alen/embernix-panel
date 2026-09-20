"use client";

import {
  ArrowRight,
  Megaphone,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

export function AnnouncementBanner() {
  const [
    visible,
    setVisible,
  ] =
    useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-[var(--primary)]" />

      <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] text-[var(--primary)]">
            <Megaphone className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Welcome to Embernix
            </p>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              The new hosting panel experience is now available for testing.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
          <Button
            variant="secondary"
            size="sm"
            icon={
              <ArrowRight className="h-4 w-4" />
            }
          >
            Learn More
          </Button>

          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() =>
              setVisible(
                false
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}