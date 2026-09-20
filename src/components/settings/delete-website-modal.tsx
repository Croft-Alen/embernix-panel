"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type DeleteWebsiteModalProps = {
  open: boolean;

  websiteName: string;

  onClose: () => void;

  onConfirm: () => void;
};

export function DeleteWebsiteModal({
  open,
  websiteName,
  onClose,
  onConfirm,
}: DeleteWebsiteModalProps) {
  const [
    confirmation,
    setConfirmation,
  ] =
    useState("");

  useEffect(() => {
    if (open) {
      setConfirmation("");
    }
  }, [open]);

  const valid =
    confirmation ===
    websiteName;

  return (
    <Modal
      open={open}
      title="Delete Website"
      description="This action permanently removes the website from Embernix."
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={
              onClose
            }
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={
              !valid
            }
            onClick={
              onConfirm
            }
          >
            Delete Website
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          This will remove the website, files, deployments, domains, environment variables and related configuration.
        </p>

        <div className="space-y-2">
          <label
            htmlFor="delete-website-confirmation"
            className="text-sm font-medium"
          >
            Type{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {websiteName}
            </span>{" "}
            to confirm
          </label>

          <input
            id="delete-website-confirmation"
            value={
              confirmation
            }
            onChange={(
              event
            ) =>
              setConfirmation(
                event.target.value
              )
            }
            className="panel-input"
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
}