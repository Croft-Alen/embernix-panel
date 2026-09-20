"use client";

import {
  File,
  FileCode2,
  FileJson,
  FileText,
  Folder,
} from "lucide-react";

import {
  FileActions,
} from "@/components/files/file-actions";

import type {
  FileItem,
} from "@/features/files/types";

type FileRowProps = {
  item: FileItem;

  selected?: boolean;

  onSelect?: (
    item: FileItem,
    selected: boolean
  ) => void;

  onOpen: (
    item: FileItem
  ) => void;

  onRename?: (
    item: FileItem
  ) => void;

  onMove?: (
    item: FileItem
  ) => void;

  onCopy?: (
    item: FileItem
  ) => void;

  onDownload?: (
    item: FileItem
  ) => void;

  onCompress?: (
    item: FileItem
  ) => void;

  onExtractHere?: (
    item: FileItem
  ) => void;

  onExtractTo?: (
    item: FileItem
  ) => void;

  onDelete?: (
    item: FileItem
  ) => void;
};

export function FileRow({
  item,
  selected = false,
  onSelect,
  onOpen,
  onRename,
  onMove,
  onCopy,
  onDownload,
  onCompress,
  onExtractHere,
  onExtractTo,
  onDelete,
}: FileRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() =>
        onOpen(
          item
        )
      }
      onKeyDown={(
        event
      ) => {
        if (
          event.key ===
            "Enter" ||
          event.key ===
            " "
        ) {
          onOpen(
            item
          );
        }
      }}
      className="grid cursor-pointer grid-cols-[36px_minmax(0,1fr)_100px_150px_40px] items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0"
    >
      <div
        className="flex items-center"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <input
          type="checkbox"
          checked={
            selected
          }
          onChange={(
            event
          ) =>
            onSelect?.(
              item,
              event.target
                .checked
            )
          }
          className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
          aria-label={`Select ${item.name}`}
        />
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <FileIcon
          item={
            item
          }
        />

        <span className="truncate text-sm font-medium">
          {item.name}
        </span>
      </div>

      <div className="text-sm text-[var(--muted-foreground)]">
        {item.type ===
        "folder"
          ? "—"
          : formatBytes(
              item.size ??
                0
            )}
      </div>

      <div className="text-sm text-[var(--muted-foreground)]">
        {formatDate(
          item.updatedAt
        )}
      </div>

      <div
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <FileActions
          item={
            item
          }
          onEdit={
            item.type ===
            "file"
              ? onOpen
              : undefined
          }
          onRename={
            onRename
          }
          onMove={
            onMove
          }
          onCopy={
            onCopy
          }
          onDownload={
            onDownload
          }
          onCompress={
            onCompress
          }
          onExtractHere={
            onExtractHere
          }
          onExtractTo={
            onExtractTo
          }
          onDelete={
            onDelete
          }
        />
      </div>
    </div>
  );
}

function FileIcon({
  item,
}: {
  item: FileItem;
}) {
  if (
    item.type ===
    "folder"
  ) {
    return (
      <Folder className="h-5 w-5 shrink-0 text-[var(--primary)]" />
    );
  }

  if (
    item.extension ===
    "json"
  ) {
    return (
      <FileJson className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
    );
  }

  if (
    item.extension ===
      "tsx" ||
    item.extension ===
      "ts" ||
    item.extension ===
      "js" ||
    item.extension ===
      "jsx"
  ) {
    return (
      <FileCode2 className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
    );
  }

  if (
    item.extension ===
      "css" ||
    item.extension ===
      "md" ||
    item.extension ===
      "txt"
  ) {
    return (
      <FileText className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
    );
  }

  return (
    <File className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
  );
}

function formatBytes(
  bytes: number
) {
  if (
    bytes ===
    0
  ) {
    return "0 B";
  }

  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }

  const kb =
    bytes /
    1024;

  if (
    kb <
    1024
  ) {
    return `${kb.toFixed(
      1
    )} KB`;
  }

  const mb =
    kb /
    1024;

  if (
    mb <
    1024
  ) {
    return `${mb.toFixed(
      1
    )} MB`;
  }

  return `${(
    mb /
    1024
  ).toFixed(
    2
  )} GB`;
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    }
  ).format(
    new Date(
      value
    )
  );
}