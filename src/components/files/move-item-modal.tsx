"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import type {
  FileItem,
  FileTree,
} from "@/features/files/types";

type MoveItemModalProps = {
  open: boolean;
  item: FileItem | null;
  fileTree: FileTree;
  currentPath: string;
  onClose: () => void;
  onMove: (
    item: FileItem,
    destination: string
  ) => void;
};

export function MoveItemModal({
  open,
  item,
  fileTree,
  currentPath,
  onClose,
  onMove,
}: MoveItemModalProps) {
  const [destination, setDestination] =
    useState("/");

  const folders = useMemo(() => {
    return Object.keys(fileTree)
      .filter(
        (path) =>
          path !== currentPath &&
          path !== item?.path
      )
      .sort();
  }, [
    fileTree,
    currentPath,
    item,
  ]);

  return (
    <Modal
      open={open}
      title="Move Item"
      description={
        item
          ? `Move "${item.name}" to another folder.`
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
            disabled={!item}
            onClick={() => {
              if (item) {
                onMove(
                  item,
                  destination
                );
              }
            }}
          >
            Move
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <label
          htmlFor="move-destination"
          className="text-sm font-medium"
        >
          Destination
        </label>

        <select
          id="move-destination"
          className="panel-select"
          value={destination}
          onChange={(event) =>
            setDestination(
              event.target.value
            )
          }
        >
          <option value="/">
            /
          </option>

          {folders
            .filter(
              (path) =>
                path !== "/"
            )
            .map((path) => (
              <option
                key={path}
                value={path}
              >
                {path}
              </option>
            ))}
        </select>
      </div>
    </Modal>
  );
}