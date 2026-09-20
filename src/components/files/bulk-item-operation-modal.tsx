"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type BulkOperationMode =
  | "move"
  | "copy";

type BulkItemOperationModalProps = {
  open: boolean;
  mode: BulkOperationMode;
  itemCount: number;
  defaultDestination: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    input: {
      destinationPath: string;
      overwrite: boolean;
    }
  ) => void;
};

export function BulkItemOperationModal({
  open,
  mode,
  itemCount,
  defaultDestination,
  loading = false,
  onClose,
  onSubmit,
}: BulkItemOperationModalProps) {
  const [
    destinationPath,
    setDestinationPath,
  ] = useState(
    defaultDestination
  );

  const [
    overwrite,
    setOverwrite,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDestinationPath(
      defaultDestination
    );

    setOverwrite(false);
  }, [
    open,
    defaultDestination,
    mode,
  ]);

  const isMove =
    mode ===
    "move";

  function handleSubmit() {
    const destination =
      destinationPath.trim() ||
      "/";

    onSubmit({
      destinationPath:
        destination,

      overwrite,
    });
  }

  return (
    <Modal
      open={open}
      title={
        isMove
          ? "Move selected items"
          : "Copy selected items"
      }
      description={`${
        isMove
          ? "Move"
          : "Copy"
      } ${itemCount} selected ${
        itemCount === 1
          ? "item"
          : "items"
      } to another folder.`}
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      footer={
        <>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            loading={loading}
            onClick={handleSubmit}
          >
            {isMove
              ? "Move"
              : "Copy"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="bulk-operation-destination"
            className="text-sm font-medium"
          >
            Destination folder
          </label>

          <input
            id="bulk-operation-destination"
            value={destinationPath}
            disabled={loading}
            onChange={(event) =>
              setDestinationPath(
                event.target.value
              )
            }
            placeholder="/"
            className="panel-input"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            The selected files and folders keep their current names.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={overwrite}
            disabled={loading}
            onChange={(event) =>
              setOverwrite(
                event.target.checked
              )
            }
            className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
          />

          <span>
            <span className="block text-sm font-medium">
              Overwrite existing files
            </span>

            <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
              Replace conflicting files in the destination while preserving other files already there.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}
