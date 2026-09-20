"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  Backup,
} from "@/features/backups/types";

type DeleteBackupModalProps = {
  open: boolean;

  backup:
    Backup | null;

  onClose: () => void;

  onConfirm: (
    backup: Backup
  ) => void;
};

export function DeleteBackupModal({
  open,
  backup,
  onClose,
  onConfirm,
}: DeleteBackupModalProps) {
  return (
    <Modal
      open={open}
      title="Delete Backup"
      description={
        backup
          ? `Delete Backup #${backup.number}?`
          : undefined
      }
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
              !backup
            }
            onClick={() => {
              if (
                backup
              ) {
                onConfirm(
                  backup
                );
              }
            }}
          >
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">
        This backup will be permanently removed from the current mock workspace.
      </p>
    </Modal>
  );
}