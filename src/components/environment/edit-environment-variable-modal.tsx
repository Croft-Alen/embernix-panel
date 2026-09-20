"use client";

import {
  useEffect,
  useState,
} from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  EnvironmentTarget,
  EnvironmentVariable,
} from "@/features/environment/types";

type EditEnvironmentVariableModalProps = {
  open: boolean;

  variable:
    EnvironmentVariable | null;

  onClose: () => void;

  onSave: (
    variable: EnvironmentVariable,
    key: string,
    value: string,
    target: EnvironmentTarget
  ) => void;
};

export function EditEnvironmentVariableModal({
  open,
  variable,
  onClose,
  onSave,
}: EditEnvironmentVariableModalProps) {
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
    setKey(
      variable?.key ??
        ""
    );

    setValue(
      variable?.value ??
        ""
    );

    setTarget(
      variable?.target ??
        "production"
    );
  }, [
    variable,
    open,
  ]);

  function submit() {
    if (!variable) {
      return;
    }

    const nextKey =
      key.trim();

    if (
      !nextKey ||
      !value.trim()
    ) {
      return;
    }

    onSave(
      variable,
      nextKey,
      value,
      target
    );
  }

  return (
    <Modal
      open={open}
      title="Edit Environment Variable"
      description={
        variable
          ? `Update ${variable.key}.`
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
            disabled={
              !variable ||
              !key.trim() ||
              !value.trim()
            }
            onClick={
              submit
            }
          >
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="edit-environment-key"
            className="text-sm font-medium"
          >
            Key
          </label>

          <input
            id="edit-environment-key"
            value={key}
            onChange={(
              event
            ) =>
              setKey(
                event.target.value.toUpperCase()
              )
            }
            className="panel-input font-mono"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-environment-value"
            className="text-sm font-medium"
          >
            Value
          </label>

          <textarea
            id="edit-environment-value"
            value={value}
            onChange={(
              event
            ) =>
              setValue(
                event.target.value
              )
            }
            className="panel-textarea min-h-28 font-mono"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-environment-target"
            className="text-sm font-medium"
          >
            Environment
          </label>

          <select
            id="edit-environment-target"
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
            className="panel-select"
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