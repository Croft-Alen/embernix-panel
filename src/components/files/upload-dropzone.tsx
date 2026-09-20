"use client";

import {
  FileArchive,
  FolderUp,
  UploadCloud,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import Button from "@/components/ui/Button";

export type UploadFileEntry = {
  file: File;

  relativePath: string;
};

type UploadDropzoneProps = {
  onFiles: (
    files:
      UploadFileEntry[]
  ) => void;
};

export function UploadDropzone({
  onFiles,
}: UploadDropzoneProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const folderInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    dragging,
    setDragging,
  ] =
    useState(false);

  async function handleDrop(
    event:
      React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragging(
      false
    );

    const entries =
      Array.from(
        event.dataTransfer
          .items
      );

    const collected:
      UploadFileEntry[] =
      [];

    for (
      const item
      of entries
    ) {
      const entry =
        item.webkitGetAsEntry?.();

      if (entry) {
        const result =
          await readEntry(
            entry
          );

        collected.push(
          ...result
        );

        continue;
      }

      const file =
        item.getAsFile();

      if (file) {
        collected.push({
          file,

          relativePath:
            file.name,
        });
      }
    }

    if (
      collected.length >
      0
    ) {
      onFiles(
        collected
      );
    }
  }

  function handleFiles(
    files:
      FileList | null
  ) {
    if (!files) {
      return;
    }

    const items =
      Array.from(
        files
      ).map(
        (
          file
        ) => ({
          file,

          relativePath:
            file.name,
        })
      );

    if (
      items.length >
      0
    ) {
      onFiles(
        items
      );
    }

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function handleFolder(
    files:
      FileList | null
  ) {
    if (!files) {
      return;
    }

    const items =
      Array.from(
        files
      ).map(
        (
          file
        ) => {
          const relativePath =
            file.webkitRelativePath ||
            file.name;

          return {
            file,

            relativePath:
              removeTopLevelFolder(
                relativePath
              ),
          };
        }
      );

    if (
      items.length >
      0
    ) {
      onFiles(
        items
      );
    }

    if (
      folderInputRef.current
    ) {
      folderInputRef.current.value =
        "";
    }
  }

  return (
    <>
      <input
        ref={
          fileInputRef
        }
        type="file"
        multiple
        hidden
        onChange={(
          event
        ) =>
          handleFiles(
            event.target
              .files
          )
        }
      />

      <input
        ref={
          folderInputRef
        }
        type="file"
        multiple
        hidden
        {...({
          webkitdirectory:
            "",
          directory:
            "",
        } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(
          event
        ) =>
          handleFolder(
            event.target
              .files
          )
        }
      />

      <div
        onDragEnter={(
          event
        ) => {
          event.preventDefault();

          setDragging(
            true
          );
        }}
        onDragOver={(
          event
        ) => {
          event.preventDefault();

          setDragging(
            true
          );
        }}
        onDragLeave={(
          event
        ) => {
          event.preventDefault();

          if (
            event.currentTarget ===
            event.target
          ) {
            setDragging(
              false
            );
          }
        }}
        onDrop={
          handleDrop
        }
        className={[
          "flex",
          "flex-col",
          "items-center",
          "justify-center",
          "rounded-lg",
          "border",
          "border-dashed",
          "px-6",
          "py-10",
          "text-center",
          dragging
            ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_7%,var(--surface))]"
            : "border-[var(--border-strong)] bg-[var(--surface)]",
        ].join(
          " "
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-sm font-semibold">
          Drop files or folders here
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
          Upload individual files, multiple files, or an entire project folder while preserving its directory structure.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            size="sm"
            icon={
              <FileArchive className="h-4 w-4" />
            }
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            Choose Files
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={
              <FolderUp className="h-4 w-4" />
            }
            onClick={() =>
              folderInputRef.current?.click()
            }
          >
            Choose Folder
          </Button>
        </div>
      </div>
    </>
  );
}

async function readEntry(
  entry:
    FileSystemEntry,
  parentPath = ""
): Promise<
  UploadFileEntry[]
> {
  if (
    entry.isFile
  ) {
    const fileEntry =
      entry as
        FileSystemFileEntry;

    const file =
      await getEntryFile(
        fileEntry
      );

    return [
      {
        file,

        relativePath:
          parentPath
            ? `${parentPath}/${file.name}`
            : file.name,
      },
    ];
  }

  if (
    entry.isDirectory
  ) {
    const directory =
      entry as
        FileSystemDirectoryEntry;

    const reader =
      directory.createReader();

    const children =
      await readAllDirectoryEntries(
        reader
      );

    const directoryPath =
      parentPath
        ? `${parentPath}/${directory.name}`
        : directory.name;

    const results =
      await Promise.all(
        children.map(
          (
            child
          ) =>
            readEntry(
              child,
              directoryPath
            )
        )
      );

    return results.flat();
  }

  return [];
}

function getEntryFile(
  entry:
    FileSystemFileEntry
) {
  return new Promise<File>(
    (
      resolve,
      reject
    ) => {
      entry.file(
        resolve,
        reject
      );
    }
  );
}

async function readAllDirectoryEntries(
  reader:
    FileSystemDirectoryReader
) {
  const entries:
    FileSystemEntry[] =
    [];

  while (true) {
    const batch =
      await new Promise<
        FileSystemEntry[]
      >(
        (
          resolve,
          reject
        ) => {
          reader.readEntries(
            resolve,
            reject
          );
        }
      );

    if (
      batch.length ===
      0
    ) {
      break;
    }

    entries.push(
      ...batch
    );
  }

  return entries;
}

function removeTopLevelFolder(
  path: string
) {
  const normalized =
    path
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /^\/+/,
        ""
      );

  const parts =
    normalized
      .split("/")
      .filter(
        Boolean
      );

  if (
    parts.length <=
    1
  ) {
    return normalized;
  }

  return parts
    .slice(
      1
    )
    .join("/");
}