"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  EnvironmentVariable,
} from "@/features/environment/types";

type DeleteEnvironmentVariableModalProps = {
  open: boolean;

  variable:
    EnvironmentVariable | null;

  onClose: () => void;

  onConfirm: (
    variable: EnvironmentVariable
  ) => void;
};

export function DeleteEnvironmentVariableModal({
  open,
  variable,
  onClose,
  onConfirm,
}: DeleteEnvironmentVariableModalProps) {
  return (
    <Modal
      open={open}
      title="Delete Environment Variable"
      description={
        variable
          ? `Delete ${variable.key}?`
          : undefined
      }
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={
              !variable
            }
            onClick={() => {
              if (
                variable
              ) {
                onConfirm(
                  variable
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
        This variable will be removed from this website.
      </p>
    </Modal>
  );
}