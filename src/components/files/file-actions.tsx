"use client";

import {
  Archive,
  ArchiveRestore,
  Copy,
  Download,
  EllipsisVertical,
  FilePenLine,
  FolderInput,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type { FileItem } from "@/features/files/types";

type FileActionsProps = {
  item: FileItem;

  onEdit?: (item: FileItem) => void;
  onRename?: (item: FileItem) => void;
  onMove?: (item: FileItem) => void;
  onCopy?: (item: FileItem) => void;
  onDownload?: (item: FileItem) => void;
  onCompress?: (item: FileItem) => void;
  onExtractHere?: (item: FileItem) => void;
  onExtractTo?: (item: FileItem) => void;
  onDelete?: (item: FileItem) => void;
};

export function FileActions({
  item,
  onEdit,
  onRename,
  onMove,
  onCopy,
  onDownload,
  onCompress,
  onExtractHere,
  onExtractTo,
  onDelete,
}: FileActionsProps) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isArchive = isZipFile(item);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        !containerRef.current?.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  function runAction(
    callback:
      | ((item: FileItem) => void)
      | undefined
  ) {
    setOpen(false);
    callback?.(item);
  }

  const hasAnyAction = Boolean(
    onEdit ||
      onRename ||
      onMove ||
      onCopy ||
      onDownload ||
      onCompress ||
      onExtractHere ||
      onExtractTo ||
      onDelete
  );

  if (!hasAnyAction) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label={`Actions for ${item.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)]"
      >
        <EllipsisVertical className="h-4 w-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close file actions"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div
            role="menu"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="absolute bottom-9 right-0 z-50 min-w-52 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-1 shadow-xl"
          >
            {onEdit &&
              item.type === "file" && (
                <ActionItem
                  icon={
                    <FilePenLine className="h-4 w-4" />
                  }
                  label="Edit"
                  onClick={() =>
                    runAction(onEdit)
                  }
                />
              )}

            {onDownload &&
              item.type === "file" && (
                <ActionItem
                  icon={
                    <Download className="h-4 w-4" />
                  }
                  label="Download"
                  onClick={() =>
                    runAction(onDownload)
                  }
                />
              )}

            {onCompress && (
              <ActionItem
                icon={
                  <Archive className="h-4 w-4" />
                }
                label="Compress to ZIP"
                onClick={() =>
                  runAction(onCompress)
                }
              />
            )}

            {onRename && (
              <ActionItem
                icon={
                  <Pencil className="h-4 w-4" />
                }
                label="Rename"
                onClick={() =>
                  runAction(onRename)
                }
              />
            )}

            {onMove && (
              <ActionItem
                icon={
                  <FolderInput className="h-4 w-4" />
                }
                label="Move"
                onClick={() =>
                  runAction(onMove)
                }
              />
            )}

            {onCopy && (
              <ActionItem
                icon={
                  <Copy className="h-4 w-4" />
                }
                label="Copy"
                onClick={() =>
                  runAction(onCopy)
                }
              />
            )}

            {isArchive &&
              (onExtractHere ||
                onExtractTo) && (
                <MenuDivider />
              )}

            {isArchive &&
              onExtractHere && (
                <ActionItem
                  icon={
                    <ArchiveRestore className="h-4 w-4" />
                  }
                  label="Extract Here"
                  onClick={() =>
                    runAction(
                      onExtractHere
                    )
                  }
                />
              )}

            {isArchive &&
              onExtractTo && (
                <ActionItem
                  icon={
                    <FolderInput className="h-4 w-4" />
                  }
                  label="Extract To..."
                  onClick={() =>
                    runAction(
                      onExtractTo
                    )
                  }
                />
              )}

            {onDelete && (
              <>
                <MenuDivider />

                <ActionItem
                  icon={
                    <Trash2 className="h-4 w-4" />
                  }
                  label="Delete"
                  danger
                  onClick={() =>
                    runAction(onDelete)
                  }
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ActionItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex",
        "w-full",
        "items-center",
        "gap-2.5",
        "rounded-md",
        "px-3",
        "py-2",
        "text-left",
        "text-sm",
        danger
          ? "text-[var(--danger)]"
          : "text-[var(--foreground)]",
      ].join(" ")}
    >
      {icon}

      <span>
        {label}
      </span>
    </button>
  );
}

function MenuDivider() {
  return (
    <div className="my-1 border-t border-[var(--border)]" />
  );
}

function isZipFile(item: FileItem) {
  return (
    item.type === "file" &&
    (
      item.extension?.toLowerCase() ===
        "zip" ||
      item.name
        .toLowerCase()
        .endsWith(".zip")
    )
  );
}