"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  FileItem,
} from "@/features/files/types";

type DeleteItemModalProps = {
  open: boolean;

  item:
    | FileItem
    | null;

  loading?: boolean;

  onClose: () => void;

  onConfirm: (
    item: FileItem
  ) => void;
};

export function DeleteItemModal({
  open,
  item,
  loading = false,
  onClose,
  onConfirm,
}: DeleteItemModalProps) {
  return (
    <Modal
      open={
        open
      }
      title="Delete File"
      description={
        item
          ? `Delete "${item.name}" from this website?`
          : undefined
      }
      onClose={() => {
        if (
          !loading
        ) {
          onClose();
        }
      }}
      footer={
        <>
          <Button
            variant="secondary"
            disabled={
              loading
            }
            onClick={
              onClose
            }
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={
              loading
            }
            onClick={() => {
              if (
                item
              ) {
                onConfirm(
                  item
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
        The file will be removed from Embernix storage. This action cannot be undone.
      </p>
    </Modal>
  );
}