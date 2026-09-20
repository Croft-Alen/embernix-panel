"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type CreateBackupModalProps = {
  open: boolean;

  onClose: () => void;

  onCreate: (
    name?: string
  ) => void;
};

export function CreateBackupModal({
  open,
  onClose,
  onCreate,
}: CreateBackupModalProps) {
  const [
    name,
    setName,
  ] =
    useState("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  function submit() {
    const value =
      name.trim();

    onCreate(
      value || undefined
    );
  }

  return (
    <Modal
      open={open}
      title="Create Backup"
      description="Create a new backup of this website."
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
            onClick={
              submit
            }
          >
            Create Backup
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label
          htmlFor="backup-name"
          className="text-sm font-medium"
        >
          Backup name
        </label>

        <input
          id="backup-name"
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
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Enter"
            ) {
              submit();
            }
          }}
          className="panel-input"
          placeholder="Before major update"
          autoFocus
        />

        <p className="text-xs text-[var(--muted-foreground)]">
          Optional. You can leave this blank.
        </p>
      </div>
    </Modal>
  );
}