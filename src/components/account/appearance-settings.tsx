"use client";

import {
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import type {
  AccountAppearance,
  DisplayMode,
} from "@/features/account/types";

type ThemeMode =
  | "light"
  | "dark"
  | "system";

type AppearanceSettingsProps = {
  initialAppearance: AccountAppearance;
};

export function AppearanceSettings({
  initialAppearance,
}: AppearanceSettingsProps) {
  const [
    appearance,
    setAppearance,
  ] =
    useState<AccountAppearance>(
      initialAppearance
    );

  const [
    savedAppearance,
    setSavedAppearance,
  ] =
    useState<AccountAppearance>(
      initialAppearance
    );

  const [
    theme,
    setTheme,
  ] =
    useState<ThemeMode>(
      "system"
    );

  const [
    initialTheme,
    setInitialTheme,
  ] =
    useState<ThemeMode>(
      "system"
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

  useEffect(() => {
    const stored =
      localStorage.getItem(
        "embernix-theme"
      ) as ThemeMode | null;

    if (
      stored === "light" ||
      stored === "dark" ||
      stored === "system"
    ) {
      setTheme(
        stored
      );

      setInitialTheme(
        stored
      );
    }
  }, []);

  const changed =
    JSON.stringify(
      appearance
    ) !==
      JSON.stringify(
        savedAppearance
      ) ||
    theme !==
      initialTheme;

  function setDisplayMode(
    displayMode: DisplayMode
  ) {
    setAppearance(
      (
        current
      ) => ({
        ...current,
        displayMode,
      })
    );
  }

  function toggleSetting(
    key:
      | "privacyMode"
      | "animations"
  ) {
    setAppearance(
      (
        current
      ) => ({
        ...current,
        [key]:
          !current[key],
      })
    );
  }

  async function save() {
    setSaving(true);
    setSaved(false);

    await new Promise(
      (
        resolve
      ) =>
        window.setTimeout(
          resolve,
          350
        )
    );

    localStorage.setItem(
      "embernix-theme",
      theme
    );

    setSavedAppearance(
      appearance
    );

    setInitialTheme(
      theme
    );

    setSaving(false);
    setSaved(true);

    window.setTimeout(
      () =>
        setSaved(
          false
        ),
      1600
    );

    window.dispatchEvent(
      new Event(
        "storage"
      )
    );
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold">
          Appearance
        </h2>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Customize how the Embernix panel looks and behaves.
        </p>
      </div>

      <div className="divide-y divide-[var(--border)]">
        <SettingRow
          title="Theme"
          description="Choose how the panel theme should appear."
        >
          <div className="flex flex-wrap gap-2">
            <ChoiceButton
              active={
                theme ===
                "light"
              }
              icon={
                <Sun className="h-4 w-4" />
              }
              label="Light"
              onClick={() =>
                setTheme(
                  "light"
                )
              }
            />

            <ChoiceButton
              active={
                theme ===
                "dark"
              }
              icon={
                <Moon className="h-4 w-4" />
              }
              label="Dark"
              onClick={() =>
                setTheme(
                  "dark"
                )
              }
            />

            <ChoiceButton
              active={
                theme ===
                "system"
              }
              icon={
                <Monitor className="h-4 w-4" />
              }
              label="System"
              onClick={() =>
                setTheme(
                  "system"
                )
              }
            />
          </div>
        </SettingRow>

        <SettingRow
          title="Display Mode"
          description="Choose the density of the panel interface."
        >
          <div className="flex gap-2">
            <ChoiceButton
              active={
                appearance.displayMode ===
                "normal"
              }
              label="Normal"
              onClick={() =>
                setDisplayMode(
                  "normal"
                )
              }
            />

            <ChoiceButton
              active={
                appearance.displayMode ===
                "compact"
              }
              label="Compact"
              onClick={() =>
                setDisplayMode(
                  "compact"
                )
              }
            />
          </div>
        </SettingRow>

        <SettingRow
          title="Privacy Mode"
          description="Hide sensitive information in supported areas of the panel."
        >
          <Toggle
            enabled={
              appearance.privacyMode
            }
            onClick={() =>
              toggleSetting(
                "privacyMode"
              )
            }
          />
        </SettingRow>

        <SettingRow
          title="Animations"
          description="Enable motion and interface animations throughout the panel."
        >
          <Toggle
            enabled={
              appearance.animations
            }
            onClick={() =>
              toggleSetting(
                "animations"
              )
            }
          />
        </SettingRow>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-4">
        <span className="text-xs text-[var(--muted-foreground)]">
          {saved
            ? "Appearance updated."
            : changed
              ? "You have unsaved changes."
              : "No unsaved changes."}
        </span>

        <Button
          loading={
            saving
          }
          disabled={
            !changed
          }
          onClick={
            save
          }
        >
          Save Appearance
        </Button>
      </div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>

      <div className="shrink-0">
        {children}
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex",
        "h-9",
        "items-center",
        "gap-2",
        "rounded-md",
        "border",
        "px-3",
        "text-sm",
        "font-medium",
        "transition-none",

        active
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]",
      ].join(" ")}
    >
      {icon}

      {label}
    </button>
  );
}

function Toggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onClick}
      className={[
        "relative",
        "inline-flex",
        "h-7",
        "w-12",
        "shrink-0",
        "items-center",
        "rounded-full",
        "border",
        "p-1",
        "transition-none",
        "outline-none",

        enabled
          ? "border-[var(--primary)] bg-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--surface-strong)]",
      ].join(" ")}
    >
      <span
        className={[
          "block",
          "h-5",
          "w-5",
          "rounded-full",
          "bg-white",
          "shadow-sm",
          "transition-transform",
          "duration-150",

          enabled
            ? "translate-x-5"
            : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}