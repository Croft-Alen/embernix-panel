"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  EnvironmentTarget,
} from "@/features/environment/types";

type AddEnvironmentVariableModalProps = {
  open: boolean;

  onClose: () => void;

  onAdd: (
    key: string,
    value: string,
    target: EnvironmentTarget
  ) => void;
};

export function AddEnvironmentVariableModal({
  open,
  onClose,
  onAdd,
}: AddEnvironmentVariableModalProps) {
  const [
    key,
    setKey,
  ] =
    useState("");

  const [
    value,
    setValue,
  ] =
    useState("");

  const [
    target,
    setTarget,
  ] =
    useState<EnvironmentTarget>(
      "production"
    );

  useEffect(() => {
    if (open) {
      setKey("");
      setValue("");
      setTarget(
        "production"
      );
    }
  }, [open]);

  function submit() {
    const nextKey =
      key.trim();

    if (
      !nextKey ||
      !value.trim()
    ) {
      return;
    }

    onAdd(
      nextKey,
      value,
      target
    );
  }

  return (
    <Modal
      open={open}
      title="Add Environment Variable"
      description="Add a variable to your website environment."
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
            disabled={
              !key.trim() ||
              !value.trim()
            }
            onClick={
              submit
            }
          >
            Add Variable
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="environment-key"
            className="text-sm font-medium"
          >
            Key
          </label>

          <input
            id="environment-key"
            value={key}
            onChange={(
              event
            ) =>
              setKey(
                event.target.value.toUpperCase()
              )
            }
            className="panel-input font-mono"
            placeholder="DATABASE_URL"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="environment-value"
            className="text-sm font-medium"
          >
            Value
          </label>

          <textarea
            id="environment-value"
            value={value}
            onChange={(
              event
            ) =>
              setValue(
                event.target.value
              )
            }
            className="panel-textarea min-h-28 font-mono"
            placeholder="Enter variable value"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="environment-target"
            className="text-sm font-medium"
          >
            Environment
          </label>

          <select
            id="environment-target"
            className="panel-select"
            value={
              target
            }
            onChange={(
              event
            ) =>
              setTarget(
                event.target.value as EnvironmentTarget
              )
            }
          >
            <option value="production">
              Production
            </option>

            <option value="preview">
              Preview
            </option>

            <option value="both">
              Production & Preview
            </option>
          </select>
        </div>
      </div>
    </Modal>
  );
}