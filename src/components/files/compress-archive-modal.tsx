"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type CompressArchiveModalProps = {
  open: boolean;
  itemCount: number;
  defaultArchiveName: string;
  defaultDestination: string;
  loading?: boolean;
  onClose: () => void;
  onCompress: (options: {
    archiveName: string;
    destinationPath: string;
    overwrite: boolean;
  }) => void;
};

export function CompressArchiveModal({
  open,
  itemCount,
  defaultArchiveName,
  defaultDestination,
  loading = false,
  onClose,
  onCompress,
}: CompressArchiveModalProps) {
  const [archiveName, setArchiveName] = useState(defaultArchiveName);
  const [destinationPath, setDestinationPath] =
    useState(defaultDestination);
  const [overwrite, setOverwrite] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setArchiveName(defaultArchiveName);
    setDestinationPath(defaultDestination);
    setOverwrite(false);
  }, [open, defaultArchiveName, defaultDestination]);

  function handleSubmit() {
    const cleanName = archiveName.trim();

    if (!cleanName) {
      return;
    }

    onCompress({
      archiveName: ensureZipExtension(cleanName),
      destinationPath:
        destinationPath.trim() || "/",
      overwrite,
    });
  }

  return (
    <Modal
      open={open}
      title="Compress to ZIP"
      description={`Create a ZIP archive from ${itemCount} selected ${
        itemCount === 1 ? "item" : "items"
      }.`}
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
            Create ZIP
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="archive-name"
            className="text-sm font-medium"
          >
            Archive name
          </label>

          <input
            id="archive-name"
            value={archiveName}
            disabled={loading}
            onChange={(event) =>
              setArchiveName(event.target.value)
            }
            placeholder="archive.zip"
            className="panel-input"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            .zip will be added automatically if needed.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="archive-destination"
            className="text-sm font-medium"
          >
            Destination
          </label>

          <input
            id="archive-destination"
            value={destinationPath}
            disabled={loading}
            onChange={(event) =>
              setDestinationPath(event.target.value)
            }
            placeholder="/"
            className="panel-input"
          />

          <p className="text-xs text-[var(--muted-foreground)]">
            Use / to save the archive in the website root.
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={overwrite}
            disabled={loading}
            onChange={(event) =>
              setOverwrite(event.target.checked)
            }
            className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
          />

          <span>
            <span className="block text-sm font-medium">
              Overwrite existing archive
            </span>

            <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
              Replace an existing ZIP if the destination already contains
              the same archive name.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}

function ensureZipExtension(value: string) {
  return value.toLowerCase().endsWith(".zip")
    ? value
    : `${value}.zip`;
}