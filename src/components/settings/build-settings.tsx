"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  saveBuildSettingsAction,
} from "@/app/(panel)/websites/[siteId]/settings/actions";

import type {
  PackageManager,
  WebsiteSettings,
} from "@/features/settings/types";

type BuildSettingsProps = {
  settings: WebsiteSettings;

  onSave: (
    settings: WebsiteSettings
  ) => void;
};

export function BuildSettings({
  settings,
  onSave,
}: BuildSettingsProps) {
  const [
    installCommand,
    setInstallCommand,
  ] =
    useState(
      settings.installCommand
    );

  const [
    buildCommand,
    setBuildCommand,
  ] =
    useState(
      settings.buildCommand
    );

  const [
    outputDirectory,
    setOutputDirectory,
  ] =
    useState(
      settings.outputDirectory
    );

  const [
    nodeVersion,
    setNodeVersion,
  ] =
    useState(
      settings.nodeVersion
    );

  const [
    packageManager,
    setPackageManager,
  ] =
    useState<PackageManager>(
      settings.packageManager
    );

  const [
    autoDeploy,
    setAutoDeploy,
  ] =
    useState(
      settings.autoDeploy
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
    setInstallCommand(
      settings.installCommand
    );

    setBuildCommand(
      settings.buildCommand
    );

    setOutputDirectory(
      settings.outputDirectory
    );

    setNodeVersion(
      settings.nodeVersion
    );

    setPackageManager(
      settings.packageManager
    );

    setAutoDeploy(
      settings.autoDeploy
    );
  }, [settings]);

  const changed =
    installCommand !==
      settings.installCommand ||
    buildCommand !==
      settings.buildCommand ||
    outputDirectory !==
      settings.outputDirectory ||
    nodeVersion !==
      settings.nodeVersion ||
    packageManager !==
      settings.packageManager ||
    autoDeploy !==
      settings.autoDeploy;

  async function handleSubmit() {
    if (
      !installCommand.trim() ||
      !buildCommand.trim() ||
      !outputDirectory.trim() ||
      !nodeVersion.trim() ||
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
      await saveBuildSettingsAction(
        {
          websiteId:
            settings.websiteId,

          installCommand:
            installCommand.trim(),

          buildCommand:
            buildCommand.trim(),

          outputDirectory:
            outputDirectory.trim(),

          nodeVersion:
            nodeVersion.trim(),

          packageManager,

          autoDeploy,

          productionBranch:
            settings.productionBranch,
        }
      );

      const nextSettings = {
        ...settings,

        installCommand:
          installCommand.trim(),

        buildCommand:
          buildCommand.trim(),

        outputDirectory:
          outputDirectory.trim(),

        nodeVersion:
          nodeVersion.trim(),

        packageManager,

        autoDeploy,
      };

      onSave(
        nextSettings
      );

      setSaved(
        true
      );

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
          : "Failed to save build settings."
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
          Build Settings
        </h2>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Configure how Embernix installs and builds this website.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <label
            htmlFor="install-command"
            className="text-sm font-medium"
          >
            Install Command
          </label>

          <input
            id="install-command"
            value={
              installCommand
            }
            onChange={(
              event
            ) =>
              setInstallCommand(
                event.target.value
              )
            }
            className="panel-input font-mono"
            placeholder="npm install"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            Command used to install project dependencies.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="build-command"
            className="text-sm font-medium"
          >
            Build Command
          </label>

          <input
            id="build-command"
            value={
              buildCommand
            }
            onChange={(
              event
            ) =>
              setBuildCommand(
                event.target.value
              )
            }
            className="panel-input font-mono"
            placeholder="npm run build"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            Command executed to create the production build.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="output-directory"
            className="text-sm font-medium"
          >
            Output Directory
          </label>

          <input
            id="output-directory"
            value={
              outputDirectory
            }
            onChange={(
              event
            ) =>
              setOutputDirectory(
                event.target.value
              )
            }
            className="panel-input font-mono"
            placeholder=".next"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            Directory containing the generated build output.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="node-version"
              className="text-sm font-medium"
            >
              Node Version
            </label>

            <input
              id="node-version"
              value={
                nodeVersion
              }
              onChange={(
                event
              ) =>
                setNodeVersion(
                  event.target.value
                )
              }
              className="panel-input font-mono"
              placeholder="20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="package-manager"
              className="text-sm font-medium"
            >
              Package Manager
            </label>

            <select
              id="package-manager"
              value={
                packageManager
              }
              onChange={(
                event
              ) =>
                setPackageManager(
                  event.target
                    .value as PackageManager
                )
              }
              className="panel-input"
            >
              <option value="npm">
                npm
              </option>

              <option value="pnpm">
                pnpm
              </option>

              <option value="yarn">
                yarn
              </option>

              <option value="bun">
                bun
              </option>
            </select>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] p-4">
          <div>
            <p className="text-sm font-medium">
              Automatic Deployments
            </p>

            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Automatically create deployments when the connected production source changes.
            </p>
          </div>

          <input
            type="checkbox"
            checked={
              autoDeploy
            }
            onChange={(
              event
            ) =>
              setAutoDeploy(
                event.target.checked
              )
            }
            className="h-4 w-4"
          />
        </label>

        {error && (
          <p className="text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-4">
        <span className="text-xs text-[var(--muted-foreground)]">
          {saved
            ? "Build settings saved."
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
            !installCommand.trim() ||
            !buildCommand.trim() ||
            !outputDirectory.trim() ||
            !nodeVersion.trim()
          }
          onClick={() => {
            void handleSubmit();
          }}
        >
          Save Build Settings
        </Button>
      </div>
    </section>
  );
}