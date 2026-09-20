"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  FileItem,
} from "@/features/files/types";

type ExtractArchiveModalProps = {
  open: boolean;

  item:
    | FileItem
    | null;

  defaultDestination:
    string;

  destinationLocked?:
    boolean;

  loading?:
    boolean;

  onClose:
    () => void;

  onExtract: (
    options: {
      destinationPath:
        string;

      overwrite:
        boolean;

      deleteArchiveAfter:
        boolean;
    }
  ) => void;
};

export function ExtractArchiveModal({
  open,
  item,
  defaultDestination,
  destinationLocked = false,
  loading = false,
  onClose,
  onExtract,
}: ExtractArchiveModalProps) {
  const [
    destination,
    setDestination,
  ] =
    useState(
      defaultDestination
    );

  const [
    overwrite,
    setOverwrite,
  ] =
    useState(
      true
    );

  const [
    deleteArchiveAfter,
    setDeleteArchiveAfter,
  ] =
    useState(
      false
    );

  useEffect(
    () => {
      if (open) {
        setDestination(
          defaultDestination
        );

        setOverwrite(
          true
        );

        setDeleteArchiveAfter(
          false
        );
      }
    },
    [
      open,
      defaultDestination,
    ]
  );

  return (
    <Modal
      open={
        open
      }
      title={
        item
          ? `Extract ${item.name}`
          : "Extract Archive"
      }
      description="Extract the ZIP archive into your website files."
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
            loading={
              loading
            }
            onClick={() =>
              onExtract({
                destinationPath:
                  destination,

                overwrite,

                deleteArchiveAfter,
              })
            }
          >
            Extract
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="extract-destination"
            className="text-sm font-medium"
          >
            Destination
          </label>

          <input
            id="extract-destination"
            className="panel-input"
            value={
              destination
            }
            disabled={
              destinationLocked ||
              loading
            }
            onChange={(
              event
            ) =>
              setDestination(
                event.target
                  .value
              )
            }
            placeholder="/"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            Use / to extract into the website root.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={
              overwrite
            }
            disabled={
              loading
            }
            onChange={(
              event
            ) =>
              setOverwrite(
                event.target
                  .checked
              )
            }
            className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
          />

          <span>
            <span className="block text-sm font-medium">
              Overwrite existing files
            </span>

            <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
              Existing files with matching paths will be replaced.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={
              deleteArchiveAfter
            }
            disabled={
              loading
            }
            onChange={(
              event
            ) =>
              setDeleteArchiveAfter(
                event.target
                  .checked
              )
            }
            className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
          />

          <span>
            <span className="block text-sm font-medium">
              Delete archive after extraction
            </span>

            <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
              Removes the ZIP after all extracted files are written successfully.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}