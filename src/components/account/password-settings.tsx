"use client";

import {
  KeyRound,
} from "lucide-react";
import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

export function PasswordSettings() {
  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

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

  const valid =
    currentPassword.length >
      0 &&
    newPassword.length >=
      8 &&
    newPassword ===
      confirmPassword;

  async function updatePassword() {
    if (!valid) {
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
          600
        )
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

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
      <div className="flex items-start gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--surface-strong)] text-[var(--primary)]">
          <KeyRound className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-sm font-semibold">
            Update Password
          </h2>

          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Change the password used to access your Embernix account.
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <PasswordField
          id="current-password"
          label="Current Password"
          value={
            currentPassword
          }
          onChange={
            setCurrentPassword
          }
        />

        <PasswordField
          id="new-password"
          label="New Password"
          value={
            newPassword
          }
          onChange={
            setNewPassword
          }
        />

        <p className="-mt-2 text-xs text-[var(--muted-foreground)]">
          Your new password should be at least 8 characters long and unique to your Embernix account.
        </p>

        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={
            confirmPassword
          }
          onChange={
            setConfirmPassword
          }
        />

        {confirmPassword &&
          newPassword !==
            confirmPassword && (
            <p className="text-xs text-[var(--danger)]">
              Passwords do not match.
            </p>
          )}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
        <span className="text-xs text-[var(--muted-foreground)]">
          {saved
            ? "Password updated."
            : ""}
        </span>

        <Button
          loading={
            saving
          }
          disabled={
            !valid
          }
          onClick={
            updatePassword
          }
        >
          Update Password
        </Button>
      </div>
    </section>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
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
        type="password"
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="panel-input"
        autoComplete="off"
      />
    </div>
  );
}