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

type OperationMode =
  | "rename"
  | "move"
  | "copy";

type ItemOperationModalProps = {
  open: boolean;

  mode:
    OperationMode;

  item:
    FileItem | null;

  loading?: boolean;

  onClose:
    () => void;

  onSubmit:
    (
      input: {
        value:
          string;

        overwrite:
          boolean;
      }
    ) => void;
};

export function ItemOperationModal({
  open,
  mode,
  item,
  loading = false,
  onClose,
  onSubmit,
}: ItemOperationModalProps) {
  const [
    value,
    setValue,
  ] =
    useState("");

  const [
    overwrite,
    setOverwrite,
  ] =
    useState(false);

  useEffect(() => {
    if (
      !open ||
      !item
    ) {
      return;
    }

    if (
      mode ===
      "rename"
    ) {
      setValue(
        item.name
      );
    } else {
      setValue(
        getParentPath(
          item.path
        )
      );
    }

    setOverwrite(
      false
    );
  }, [
    open,
    mode,
    item,
  ]);

  if (!item) {
    return null;
  }

  function handleSubmit() {
    const clean =
      value.trim();

    if (!clean) {
      return;
    }

    onSubmit({
      value:
        clean,

      overwrite,
    });
  }

  const title =
    mode ===
    "rename"
      ? "Rename"
      : mode ===
          "move"
        ? "Move"
        : "Copy";

  const description =
    mode ===
    "rename"
      ? `Rename "${item.name}".`
      : mode ===
          "move"
        ? `Move "${item.name}" to another location.`
        : `Create a copy of "${item.name}".`;

  const label =
    mode ===
    "rename"
      ? "New name"
      : "Destination";

  const placeholder =
    mode ===
    "rename"
      ? item.name
      : "/";

  const actionLabel =
    mode ===
    "rename"
      ? "Rename"
      : mode ===
          "move"
        ? "Move"
        : "Copy";

  return (
    <Modal
      open={open}
      title={title}
      description={
        description
      }
      onClose={() => {
        if (!loading) {
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
            onClick={
              handleSubmit
            }
          >
            {actionLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="item-operation-value"
            className="text-sm font-medium"
          >
            {label}
          </label>

          <input
            id="item-operation-value"
            value={
              value
            }
            disabled={
              loading
            }
            onChange={(
              event
            ) =>
              setValue(
                event.target
                  .value
              )
            }
            placeholder={
              placeholder
            }
            className="panel-input"
          />

          {mode !==
            "rename" && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Enter a folder path such as /src/components or /public.
            </p>
          )}
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
              Replace conflicting files at the destination.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}

function getParentPath(
  path: string
) {
  const parts =
    path
      .split("/")
      .filter(
        Boolean
      );

  parts.pop();

  return parts.length
    ? `/${parts.join("/")}`
    : "/";
}