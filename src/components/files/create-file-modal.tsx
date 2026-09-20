"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type CreateFileModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export function CreateFileModal({
  open,
  onClose,
  onCreate,
}: CreateFileModalProps) {
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
      title="Create File"
      description="Create a new file in the current folder."
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
            Create File
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label
          htmlFor="new-file-name"
          className="text-sm font-medium"
        >
          File name
        </label>

        <input
          id="new-file-name"
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
          placeholder="page.tsx"
          autoFocus
        />
      </div>
    </Modal>
  );
}