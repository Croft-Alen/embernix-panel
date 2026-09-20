"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Button from "@/components/ui/Button";

import {
  saveGeneralSettingsAction,
} from "@/app/(panel)/websites/[siteId]/settings/actions";

import type {
  WebsiteSettings,
} from "@/features/settings/types";

type GeneralSettingsProps = {
  settings: WebsiteSettings;

  onSave: (
    settings: WebsiteSettings
  ) => void;
};

export function GeneralSettings({
  settings,
  onSave,
}: GeneralSettingsProps) {
  const router =
    useRouter();

  const [
    name,
    setName,
  ] =
    useState(
      settings.name
    );

  const [
    subdomain,
    setSubdomain,
  ] =
    useState(
      settings.subdomain
    );

  const [
    productionBranch,
    setProductionBranch,
  ] =
    useState(
      settings.productionBranch
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    saved,
    setSaved,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string>();

  useEffect(() => {
    setName(
      settings.name
    );

    setSubdomain(
      settings.subdomain
    );

    setProductionBranch(
      settings.productionBranch
    );
  }, [settings]);

  const normalizedSubdomain =
    normalizeSubdomain(
      subdomain
    );

  const changed =
    name !==
      settings.name ||
    normalizedSubdomain !==
      settings.subdomain ||
    productionBranch !==
      settings.productionBranch;

  async function handleSubmit() {
    if (
      !name.trim() ||
      !normalizedSubdomain ||
      !productionBranch.trim() ||
      saving
    ) {
      return;
    }

    setSaving(
      true
    );

    setSaved(
      false
    );

    setError(
      undefined
    );

    try {
      await saveGeneralSettingsAction(
        {
          websiteId:
            settings.websiteId,

          name:
            name.trim(),

          subdomain:
            normalizedSubdomain,

          productionBranch:
            productionBranch.trim(),
        }
      );

      const nextSettings = {
        ...settings,

        name:
          name.trim(),

        subdomain:
          normalizedSubdomain,

        productionBranch:
          productionBranch.trim(),
      };

      setSubdomain(
        normalizedSubdomain
      );

      onSave(
        nextSettings
      );

      setSaved(
        true
      );

      router.refresh();

      window.setTimeout(
        () =>
          setSaved(
            false
          ),
        1600
      );
    } catch (
      saveError
    ) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save settings."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold">
          General
        </h2>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Manage basic website information and production settings.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <label
            htmlFor="website-name"
            className="text-sm font-medium"
          >
            Website Name
          </label>

          <input
            id="website-name"
            value={
              name
            }
            onChange={(
              event
            ) =>
              setName(
                event.target.value
              )
            }
            className="panel-input"
            placeholder="My Website"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="website-subdomain"
            className="text-sm font-medium"
          >
            Embernix Subdomain
          </label>

          <div className="flex overflow-hidden rounded-md border border-[var(--border-strong)] bg-[var(--surface)]">
            <input
              id="website-subdomain"
              value={
                subdomain
              }
              onChange={(
                event
              ) =>
                setSubdomain(
                  normalizeSubdomain(
                    event.target.value
                  )
                )
              }
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
              placeholder="my-website"
            />

            <div className="flex items-center border-l border-[var(--border)] bg-[var(--surface-strong)] px-3 text-sm text-[var(--muted-foreground)]">
              .embernix.site
            </div>
          </div>

          <p className="text-xs text-[var(--muted-foreground)]">
            Your Embernix-provided website address.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="framework"
            className="text-sm font-medium"
          >
            Framework
          </label>

          <input
            id="framework"
            value={
              settings.framework
            }
            disabled
            className="panel-input cursor-not-allowed opacity-70"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            Framework detection is managed by Embernix.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="production-branch"
            className="text-sm font-medium"
          >
            Production Branch
          </label>

          <input
            id="production-branch"
            value={
              productionBranch
            }
            onChange={(
              event
            ) =>
              setProductionBranch(
                event.target.value
              )
            }
            className="panel-input font-mono"
            placeholder="main"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-4">
        <span className="text-xs text-[var(--muted-foreground)]">
          {saved
            ? "Changes saved."
            : changed
              ? "You have unsaved changes."
              : "No unsaved changes."}
        </span>

        <Button
          loading={
            saving
          }
          disabled={
            !changed ||
            !name.trim() ||
            !normalizedSubdomain ||
            !productionBranch.trim()
          }
          onClick={() => {
            void handleSubmit();
          }}
        >
          Save Changes
        </Button>
      </div>
    </section>
  );
}

function normalizeSubdomain(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9-]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}