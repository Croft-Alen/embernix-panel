"use client";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import type {
  AccountProfile,
} from "@/features/account/types";

type ProfileSettingsProps = {
  initialProfile: AccountProfile;
};

export function ProfileSettings({
  initialProfile,
}: ProfileSettingsProps) {
  const [
    profile,
    setProfile,
  ] =
    useState<AccountProfile>(
      initialProfile
    );

  const [
    savedProfile,
    setSavedProfile,
  ] =
    useState<AccountProfile>(
      initialProfile
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

  const changed =
    JSON.stringify(profile) !==
    JSON.stringify(savedProfile);

  function updateField(
    key: keyof AccountProfile,
    value: string
  ) {
    setProfile(
      (
        current
      ) => ({
        ...current,
        [key]: value,
      })
    );
  }

  async function save() {
    if (
      !profile.firstName.trim() ||
      !profile.lastName.trim() ||
      !profile.username.trim() ||
      !profile.email.trim()
    ) {
      return;
    }

    setSaving(true);
    setSaved(false);

    await new Promise(
      (
        resolve
      ) =>
        window.setTimeout(
          resolve,
          450
        )
    );

    setSavedProfile(
      profile
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
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold">
          Profile
        </h2>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Manage your personal Embernix account information.
        </p>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        <Field
          id="first-name"
          label="First Name"
          value={
            profile.firstName
          }
          onChange={(
            value
          ) =>
            updateField(
              "firstName",
              value
            )
          }
        />

        <Field
          id="last-name"
          label="Last Name"
          value={
            profile.lastName
          }
          onChange={(
            value
          ) =>
            updateField(
              "lastName",
              value
            )
          }
        />

        <Field
          id="username"
          label="Username"
          value={
            profile.username
          }
          onChange={(
            value
          ) =>
            updateField(
              "username",
              value
            )
          }
        />

        <Field
          id="email"
          label="Email Address"
          type="email"
          value={
            profile.email
          }
          onChange={(
            value
          ) =>
            updateField(
              "email",
              value
            )
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-5 py-4">
        <p className="text-xs text-[var(--muted-foreground)]">
          {saved
            ? "Profile updated."
            : changed
              ? "You have unsaved changes."
              : "No unsaved changes."}
        </p>

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
          Update Profile
        </Button>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  type?: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="panel-input"
      />
    </div>
  );
}