"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  Backup,
} from "@/features/backups/types";

type RestoreBackupModalProps = {
  open: boolean;

  backup:
    Backup | null;

  onClose: () => void;

  onConfirm: (
    backup: Backup
  ) => void;
};

export function RestoreBackupModal({
  open,
  backup,
  onClose,
  onConfirm,
}: RestoreBackupModalProps) {
  return (
    <Modal
      open={open}
      title="Restore Backup"
      description={
        backup
          ? `Restore Backup #${backup.number}?`
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
            Restore Backup
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">
        Restoring this backup will replace the current website files with the backup contents.
      </p>
    </Modal>
  );
}