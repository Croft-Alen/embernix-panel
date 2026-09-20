"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type AddDomainModalProps = {
  open: boolean;

  onClose: () => void;

  onAdd: (
    hostname: string
  ) => void;
};

export function AddDomainModal({
  open,
  onClose,
  onAdd,
}: AddDomainModalProps) {
  const [
    hostname,
    setHostname,
  ] =
    useState("");

  useEffect(() => {
    if (open) {
      setHostname("");
    }
  }, [open]);

  function submit() {
    const value =
      hostname
        .trim()
        .toLowerCase();

    if (!value) {
      return;
    }

    onAdd(
      value
    );
  }

  return (
    <Modal
      open={open}
      title="Add Domain"
      description="Connect a custom domain to this website."
      onClose={
        onClose
      }
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
              !hostname.trim()
            }
            onClick={
              submit
            }
          >
            Add Domain
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label
          htmlFor="domain-hostname"
          className="text-sm font-medium"
        >
          Domain
        </label>

        <input
          id="domain-hostname"
          value={
            hostname
          }
          onChange={(
            event
          ) =>
            setHostname(
              event.target.value
            )
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Enter"
            ) {
              submit();
            }
          }}
          className="panel-input"
          placeholder="example.com"
          autoFocus
        />

        <p className="text-xs text-[var(--muted-foreground)]">
          Enter the hostname without
          http:// or https://
        </p>
      </div>
    </Modal>
  );
}