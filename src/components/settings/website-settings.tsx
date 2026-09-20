"use client";

import {
  Trash2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  BuildSettings,
} from "@/components/settings/build-settings";

import {
  DeleteWebsiteModal,
} from "@/components/settings/delete-website-modal";

import {
  GeneralSettings,
} from "@/components/settings/general-settings";

import {
  deleteWebsiteAction,
} from "@/app/(panel)/websites/[siteId]/settings/actions";

import type {
  WebsiteSettings as WebsiteSettingsType,
} from "@/features/settings/types";

type WebsiteSettingsProps = {
  initialSettings:
    WebsiteSettingsType;
};

export function WebsiteSettings({
  initialSettings,
}: WebsiteSettingsProps) {
  const router =
    useRouter();

  const [
    settings,
    setSettings,
  ] =
    useState<WebsiteSettingsType>(
      initialSettings
    );

  const [
    deleteOpen,
    setDeleteOpen,
  ] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const [
    deleteError,
    setDeleteError,
  ] =
    useState<string>();

  function handleSettingsSaved(
    nextSettings:
      WebsiteSettingsType
  ) {
    setSettings(
      nextSettings
    );
  }

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(
      true
    );

    setDeleteError(
      undefined
    );

    try {
      await deleteWebsiteAction(
        settings.websiteId
      );

      setDeleteOpen(
        false
      );

      router.push(
        "/websites"
      );

      router.refresh();
    } catch (
      error
    ) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete website."
      );

      setDeleting(
        false
      );
    }
  }

  return (
    <>
      <div className="space-y-6">
        <GeneralSettings
          settings={
            settings
          }
          onSave={
            handleSettingsSaved
          }
        />

        <BuildSettings
          settings={
            settings
          }
          onSave={
            handleSettingsSaved
          }
        />

        <section className="rounded-lg border border-[var(--danger)]/30 bg-[var(--surface)]">
          <div className="border-b border-[var(--danger)]/20 px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--danger)]">
              Danger Zone
            </h2>

            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Destructive actions for this website.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                Delete Website
              </p>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Remove this website from your Embernix panel.
              </p>

              {deleteError && (
                <p className="mt-2 text-sm text-[var(--danger)]">
                  {deleteError}
                </p>
              )}
            </div>

            <Button
              variant="danger"
              icon={
                <Trash2 className="h-4 w-4" />
              }
              loading={
                deleting
              }
              onClick={() =>
                setDeleteOpen(
                  true
                )
              }
            >
              Delete Website
            </Button>
          </div>
        </section>
      </div>

      <DeleteWebsiteModal
        open={
          deleteOpen
        }
        websiteName={
          settings.name
        }
        onClose={() => {
          if (
            deleting
          ) {
            return;
          }

          setDeleteOpen(
            false
          );
        }}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}