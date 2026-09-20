"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type { FileItem } from "@/features/files/types";

type RenameItemModalProps = {
  open: boolean;
  item: FileItem | null;
  onClose: () => void;
  onRename: (item: FileItem, newName: string) => void;
};

export function RenameItemModal({
  open,
  item,
  onClose,
  onRename,
}: RenameItemModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(item?.name ?? "");
  }, [item, open]);

  function submit() {
    if (!item) {
      return;
    }

    const value = name.trim();

    if (!value) {
      return;
    }

    onRename(item, value);
  }

  return (
    <Modal
      open={open}
      title="Rename"
      description={
        item
          ? `Rename ${item.type === "folder" ? "folder" : "file"} "${item.name}".`
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
            onClick={submit}
            disabled={
              !name.trim() ||
              name.trim() === item?.name
            }
          >
            Rename
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label
          htmlFor="rename-item"
          className="text-sm font-medium"
        >
          New name
        </label>

        <input
          id="rename-item"
          className="panel-input"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }
          }}
          autoFocus
        />
      </div>
    </Modal>
  );
}