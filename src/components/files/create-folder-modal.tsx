"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type CreateFolderModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function CreateFolderModal({
  open,
  onClose,
  onCreate,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  function submit() {
    const value = name.trim();

    if (!value) {
      return;
    }

    onCreate(value);
  }

  return (
    <Modal
      open={open}
      title="Create Folder"
      description="Create a new folder in the current location."
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
            disabled={!name.trim()}
          >
            Create Folder
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label
          htmlFor="new-folder-name"
          className="text-sm font-medium"
        >
          Folder name
        </label>

        <input
          id="new-folder-name"
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
          placeholder="components"
          autoFocus
        />
      </div>
    </Modal>
  );
}