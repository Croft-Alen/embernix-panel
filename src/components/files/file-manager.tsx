"use client";

import {
  Archive,
  CheckSquare2,
  Copy,
  ChevronRight,
  Download,
  FilePlus2,
  FolderInput,
  Home,
  RotateCcw,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  CodeEditor,
} from "@/components/files/code-editor";

import {
  CompressArchiveModal,
} from "@/components/files/compress-archive-modal";

import {
  queueCreateArchiveAction,
  queueExtractArchiveAction,
} from "@/app/(panel)/websites/[siteId]/files/operation-actions";

import {
  BulkItemOperationModal,
} from "@/components/files/bulk-item-operation-modal";

import {
  FileOperationProgress,
} from "@/components/files/file-operation-progress";

import {
  CreateFileModal,
} from "@/components/files/create-file-modal";

import {
  DeleteItemModal,
} from "@/components/files/delete-item-modal";

import {
  ExtractArchiveModal,
} from "@/components/files/extract-archive-modal";

import {
  ItemOperationModal,
} from "@/components/files/item-operation-modal";

import {
  FileRow,
} from "@/components/files/file-row";

import {
  UploadDropzone,
} from "@/components/files/upload-dropzone";

import type {
  UploadFileEntry,
} from "@/components/files/upload-dropzone";

import {
  createWebsiteArchiveAction,
  createWebsiteFileAction,
  createWebsiteFileDownloadAction,
  copyWebsiteItemAction,
  copyWebsiteItemsAction,
  deleteWebsiteFileAction,
  deleteWebsiteItemsAction,
  finalizeWebsiteFileUploadsAction,
  getWebsiteFileContentAction,
  listWebsiteFilesAction,
  moveWebsiteItemAction,
  moveWebsiteItemsAction,
  prepareWebsiteFileUploadsAction,
  renameWebsiteItemAction,
  saveWebsiteFileContentAction,
} from "@/app/(panel)/websites/[siteId]/files/actions";

import type {
  FileItem,
  FileTree,
} from "@/features/files/types";

type FileManagerProps = {
  websiteId: string;
  initialFiles: FileTree;
  isInitialSetup?: boolean;
};

type UploadStatus =
  | "waiting"
  | "preparing"
  | "uploading"
  | "finalizing"
  | "completed"
  | "failed"
  | "canceled";

type UploadQueueItem = {
  id: string;
  file: File;
  path: string;
  status: UploadStatus;
  loadedBytes: number;
  totalBytes: number;
  progress: number;
  error?: string;
};

type PreparedUpload = {
  path: string;
  objectKey: string;
  uploadUrl: string;
  contentType: string;
  sizeBytes: number;
};

type ArchiveMode =
  | "here"
  | "to";

type ItemOperationMode =
  | "rename"
  | "move"
  | "copy";

type BulkOperationMode =
  | "move"
  | "copy";

type WebsiteFileRecord = {
  id: string;
  path: string;
  file_name: string;
  size_bytes: number;
  content_type:
    | string
    | null;
  updated_at: string;
};

export function FileManager({
  websiteId,
  initialFiles,
  isInitialSetup = false,
}: FileManagerProps) {
  const [fileTree, setFileTree] =
    useState<FileTree>(
      initialFiles
    );

  const [currentPath, setCurrentPath] =
    useState("/");

  const [
    selectedPaths,
    setSelectedPaths,
  ] = useState<Set<string>>(
    new Set()
  );

  const [
    editingFile,
    setEditingFile,
  ] =
    useState<FileItem | null>(
      null
    );

  const [
    editorValue,
    setEditorValue,
  ] = useState("");

  const [
    editorSaving,
    setEditorSaving,
  ] = useState(false);

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  const [
    uploadQueue,
    setUploadQueue,
  ] =
    useState<
      UploadQueueItem[]
    >([]);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    createFileOpen,
    setCreateFileOpen,
  ] = useState(false);

  const [
    deleteItem,
    setDeleteItem,
  ] =
    useState<FileItem | null>(
      null
    );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    bulkDeleting,
    setBulkDeleting,
  ] = useState(false);

  const [
    extractItem,
    setExtractItem,
  ] =
    useState<FileItem | null>(
      null
    );

  const [
    extractMode,
    setExtractMode,
  ] =
    useState<ArchiveMode>(
      "here"
    );

  const [
    extracting,
    setExtracting,
  ] = useState(false);

  const [
    compressOpen,
    setCompressOpen,
  ] = useState(false);

  const [
    compressPaths,
    setCompressPaths,
  ] =
    useState<string[]>([]);

  const [
    compressName,
    setCompressName,
  ] =
    useState("archive.zip");

  const [
    compressDestination,
    setCompressDestination,
  ] = useState("/");

  const [
    compressing,
    setCompressing,
  ] = useState(false);

  const [
    bulkDownloading,
    setBulkDownloading,
  ] = useState(false);

  const [
    operationItem,
    setOperationItem,
  ] =
    useState<FileItem | null>(
      null
    );

  const [
    operationMode,
    setOperationMode,
  ] =
    useState<ItemOperationMode>(
      "rename"
    );

  const [
    operating,
    setOperating,
  ] = useState(false);

  const [
    bulkOperationOpen,
    setBulkOperationOpen,
  ] = useState(false);

  const [
    bulkOperationMode,
    setBulkOperationMode,
  ] = useState<BulkOperationMode>(
    "move"
  );

  const [
    bulkOperating,
    setBulkOperating,
  ] = useState(false);

  const [notice, setNotice] =
    useState<string>();

  const [error, setError] =
    useState<string>();

  const uploadRequestsRef =
    useRef<
      Map<
        string,
        XMLHttpRequest
      >
    >(
      new Map()
    );

  const canceledUploadIdsRef =
    useRef<Set<string>>(
      new Set()
    );

  const currentFiles =
    useMemo(
      () =>
        fileTree[
          currentPath
        ] ?? [],
      [
        fileTree,
        currentPath,
      ]
    );

  const projectIsEmpty =
    (
      fileTree["/"] ??
      []
    ).length === 0;

  const selectedCount =
    selectedPaths.size;

  const allCurrentSelected =
    currentFiles.length >
      0 &&
    currentFiles.every(
      (item) =>
        selectedPaths.has(
          item.path
        )
    );

  const someCurrentSelected =
    currentFiles.some(
      (item) =>
        selectedPaths.has(
          item.path
        )
    );

  async function refreshFileTree() {
    const records =
      await listWebsiteFilesAction(
        websiteId
      );

    setFileTree(
      buildFileTree(
        records
      )
    );
  }

  async function handleOpen(
    item: FileItem
  ) {
    if (
      item.type ===
      "folder"
    ) {
      setCurrentPath(
        item.path
      );

      setSelectedPaths(
        new Set()
      );

      return;
    }

    if (
      !isEditableFile(
        item
      )
    ) {
      setError(
        "This file type cannot be opened in the code editor yet."
      );

      return;
    }

    setError(undefined);
    setNotice(undefined);

    try {
      const result =
        await getWebsiteFileContentAction(
          websiteId,
          item.path
        );

      setEditingFile({
        ...item,
        content:
          result.content,
      });

      setEditorValue(
        result.content
      );
    } catch (
      openError
    ) {
      setError(
        getErrorMessage(
          openError,
          "Failed to open file."
        )
      );
    }
  }

  async function handleSave() {
    if (
      !editingFile ||
      editorSaving
    ) {
      return;
    }

    setEditorSaving(true);
    setError(undefined);

    try {
      const saved =
        await saveWebsiteFileContentAction(
          websiteId,
          editingFile.path,
          editorValue
        );

      const nextFile:
        FileItem = {
        ...editingFile,
        id: saved.id,
        size:
          saved.sizeBytes,
        contentType:
          saved.contentType ??
          undefined,
        updatedAt:
          saved.updatedAt,
        content:
          editorValue,
      };

      replaceFileItem(
        nextFile
      );

      setEditingFile(
        nextFile
      );
    } catch (
      saveError
    ) {
      setError(
        getErrorMessage(
          saveError,
          "Failed to save file."
        )
      );
    } finally {
      setEditorSaving(
        false
      );
    }
  }

  async function handleCreateFile(
    name: string
  ) {
    const cleanName =
      normalizeFileName(
        name
      );

    if (!cleanName) {
      return;
    }

    const path =
      joinPath(
        currentPath,
        cleanName
      );

    const duplicate =
      currentFiles.some(
        (item) =>
          item.name.toLowerCase() ===
          cleanName.toLowerCase()
      );

    if (duplicate) {
      setError(
        "A file or folder with that name already exists."
      );

      return;
    }

    setError(undefined);
    setNotice(undefined);

    try {
      const saved =
        await createWebsiteFileAction(
          websiteId,
          path
        );

      const item:
        FileItem = {
        id: saved.id,
        name:
          cleanName,
        type: "file",
        path,
        size:
          saved.sizeBytes,
        extension:
          getExtension(
            cleanName
          ),
        contentType:
          saved.contentType ??
          undefined,
        updatedAt:
          saved.updatedAt,
        content: "",
      };

      addOrReplaceFile(
        currentPath,
        item
      );

      setCreateFileOpen(
        false
      );

      setEditingFile(item);
      setEditorValue("");
    } catch (
      createError
    ) {
      setError(
        getErrorMessage(
          createError,
          "Failed to create file."
        )
      );
    }
  }

  async function handleDownload(
    item: FileItem
  ) {
    if (
      item.type !==
      "file"
    ) {
      return;
    }

    setError(undefined);

    try {
      const download =
        await createWebsiteFileDownloadAction(
          websiteId,
          item.path
        );

      window.location.assign(
        download.url
      );
    } catch (
      downloadError
    ) {
      setError(
        getErrorMessage(
          downloadError,
          "Failed to create download."
        )
      );
    }
  }

  function handleCompressItem(
    item: FileItem
  ) {
    setCompressPaths([
      item.path,
    ]);

    setCompressDestination(
      getParentPath(
        item.path
      )
    );

    setCompressName(
      `${stripExtension(
        item.name
      )}.zip`
    );

    setCompressOpen(true);
    setError(undefined);
    setNotice(undefined);
  }

  function handleBulkCompress() {
    if (
      selectedPaths.size ===
      0
    ) {
      return;
    }

    setCompressPaths(
      Array.from(
        selectedPaths
      )
    );

    setCompressDestination(
      currentPath
    );

    setCompressName(
      "archive.zip"
    );

    setCompressOpen(true);
    setError(undefined);
    setNotice(undefined);
  }

  async function handleCompressArchive(
    options: {
      archiveName: string;
      destinationPath: string;
      overwrite: boolean;
    }
  ) {
    if (
      compressPaths.length ===
        0 ||
      compressing
    ) {
      return;
    }

    setCompressing(true);
    setError(undefined);
    setNotice(undefined);

    try {
      const archivePath =
        joinPath(
          normalizeUiDirectory(
            options.destinationPath
          ),
          ensureZipExtension(
            options.archiveName
          )
        );

      await queueCreateArchiveAction(
        websiteId,
        {
          paths:
            compressPaths,

          archivePath,

          overwrite:
            options.overwrite,
        }
      );

      setCompressOpen(
        false
      );

      setSelectedPaths(
        new Set()
      );

      setNotice(
        `Creating ${archivePath} in the background.`
      );
    } catch (
      compressError
    ) {
      setError(
        getErrorMessage(
          compressError,
          "Failed to queue archive creation."
        )
      );
    } finally {
      setCompressing(
        false
      );
    }
  }

  async function handleBulkDownloadZip() {
    if (
      selectedPaths.size ===
        0 ||
      bulkDownloading
    ) {
      return;
    }

    setBulkDownloading(
      true
    );

    setError(undefined);
    setNotice(undefined);

    const tempName =
      `.embernix-download-${Date.now()}.zip`;

    const tempPath =
      joinPath(
        currentPath,
        tempName
      );

    try {
      await createWebsiteArchiveAction(
        websiteId,
        {
          paths:
            Array.from(
              selectedPaths
            ),
          archivePath:
            tempPath,
          overwrite: true,
        }
      );

      const download =
        await createWebsiteFileDownloadAction(
          websiteId,
          tempPath
        );

      await downloadSignedFile(
        download.url,
        "embernix-files.zip"
      );

      await deleteWebsiteFileAction(
        websiteId,
        tempPath
      );

      setNotice(
        "Selected files downloaded as ZIP."
      );
    } catch (
      downloadError
    ) {
      setError(
        getErrorMessage(
          downloadError,
          "Failed to download selected files."
        )
      );

      try {
        await deleteWebsiteFileAction(
          websiteId,
          tempPath
        );
      } catch {
      }
    } finally {
      setBulkDownloading(
        false
      );
    }
  }

  function handleExtractHere(
    item: FileItem
  ) {
    setExtractMode("here");
    setExtractItem(item);
    setError(undefined);
    setNotice(undefined);
  }

  function handleExtractTo(
    item: FileItem
  ) {
    setExtractMode("to");
    setExtractItem(item);
    setError(undefined);
    setNotice(undefined);
  }

  async function handleExtractArchive(
    options: {
      destinationPath: string;
      overwrite: boolean;
      deleteArchiveAfter:
        boolean;
    }
  ) {
    if (
      !extractItem ||
      extracting
    ) {
      return;
    }

    setExtracting(true);
    setError(undefined);
    setNotice(undefined);

    try {
      await queueExtractArchiveAction(
        websiteId,
        {
          archivePath:
            extractItem.path,

          destinationPath:
            options.destinationPath,

          overwrite:
            options.overwrite,

          deleteArchiveAfter:
            options.deleteArchiveAfter,
        }
      );

      const archiveName =
        extractItem.name;

      setExtractItem(
        null
      );

      setSelectedPaths(
        new Set()
      );

      setNotice(
        `Extracting ${archiveName} in the background.`
      );
    } catch (
      extractError
    ) {
      setError(
        getErrorMessage(
          extractError,
          "Failed to queue archive extraction."
        )
      );
    } finally {
      setExtracting(
        false
      );
    }
  }

  function handleRenameItem(
    item: FileItem
  ) {
    setOperationMode(
      "rename"
    );

    setOperationItem(
      item
    );

    setError(undefined);
    setNotice(undefined);
  }

  function handleMoveItem(
    item: FileItem
  ) {
    setOperationMode(
      "move"
    );

    setOperationItem(
      item
    );

    setError(undefined);
    setNotice(undefined);
  }

  function handleCopyItem(
    item: FileItem
  ) {
    setOperationMode(
      "copy"
    );

    setOperationItem(
      item
    );

    setError(undefined);
    setNotice(undefined);
  }

  async function handleItemOperation(
    input: {
      value: string;
      overwrite: boolean;
    }
  ) {
    if (
      !operationItem ||
      operating
    ) {
      return;
    }

    setOperating(true);
    setError(undefined);
    setNotice(undefined);

    try {
      if (
        operationMode ===
        "rename"
      ) {
        const result =
          await renameWebsiteItemAction(
            websiteId,
            {
              sourcePath:
                operationItem.path,

              newName:
                input.value,

              overwrite:
                input.overwrite,
            }
          );

        await refreshFileTree();

        setNotice(
          `Renamed to ${getBaseName(
            result.destinationPath
          )}.`
        );
      } else {
        const destinationDirectory =
          normalizeUiDirectory(
            input.value
          );

        const destinationPath =
          joinPath(
            destinationDirectory,
            operationItem.name
          );

        if (
          operationMode ===
          "move"
        ) {
          const result =
            await moveWebsiteItemAction(
              websiteId,
              {
                sourcePath:
                  operationItem.path,

                destinationPath,

                overwrite:
                  input.overwrite,
              }
            );

          await refreshFileTree();

          if (
            currentPath ===
              operationItem.path ||
            currentPath.startsWith(
              `${operationItem.path}/`
            )
          ) {
            setCurrentPath(
              getParentPath(
                result.destinationPath
              )
            );
          }

          setNotice(
            `Moved ${operationItem.name} to ${getParentPath(
              result.destinationPath
            )}.`
          );
        } else {
          const result =
            await copyWebsiteItemAction(
              websiteId,
              {
                sourcePath:
                  operationItem.path,

                destinationPath,

                overwrite:
                  input.overwrite,
              }
            );

          await refreshFileTree();

          setNotice(
            `Copied ${operationItem.name} to ${getParentPath(
              result.destinationPath
            )}.`
          );
        }
      }

      setSelectedPaths(
        new Set()
      );

      setOperationItem(
        null
      );
    } catch (
      operationError
    ) {
      setError(
        getErrorMessage(
          operationError,
          `Failed to ${operationMode} item.`
        )
      );
    } finally {
      setOperating(false);
    }
  }

  function handleBulkMove() {
    if (
      selectedPaths.size ===
      0
    ) {
      return;
    }

    setBulkOperationMode(
      "move"
    );

    setBulkOperationOpen(
      true
    );

    setError(undefined);
    setNotice(undefined);
  }

  function handleBulkCopy() {
    if (
      selectedPaths.size ===
      0
    ) {
      return;
    }

    setBulkOperationMode(
      "copy"
    );

    setBulkOperationOpen(
      true
    );

    setError(undefined);
    setNotice(undefined);
  }

  async function handleBulkItemOperation(
    input: {
      destinationPath: string;
      overwrite: boolean;
    }
  ) {
    if (
      selectedPaths.size ===
        0 ||
      bulkOperating
    ) {
      return;
    }

    setBulkOperating(true);
    setError(undefined);
    setNotice(undefined);

    const sourcePaths =
      Array.from(
        selectedPaths
      );

    try {
      const destinationDirectory =
        normalizeUiDirectory(
          input.destinationPath
        );

      const result =
        bulkOperationMode ===
        "move"
          ? await moveWebsiteItemsAction(
              websiteId,
              {
                sourcePaths,
                destinationDirectory,
                overwrite:
                  input.overwrite,
              }
            )
          : await copyWebsiteItemsAction(
              websiteId,
              {
                sourcePaths,
                destinationDirectory,
                overwrite:
                  input.overwrite,
              }
            );

      await refreshFileTree();

      setSelectedPaths(
        new Set()
      );

      setBulkOperationOpen(
        false
      );

      setNotice(
        `${
          bulkOperationMode ===
          "move"
            ? "Moved"
            : "Copied"
        } ${result.affectedItems} ${
          result.affectedItems ===
          1
            ? "item"
            : "items"
        } to ${result.destinationDirectory}.`
      );
    } catch (
      operationError
    ) {
      setError(
        getErrorMessage(
          operationError,
          `Failed to ${bulkOperationMode} selected items.`
        )
      );
    } finally {
      setBulkOperating(false);
    }
  }

  function handleUploadSelection(
    entries:
      UploadFileEntry[]
  ) {
    if (
      entries.length ===
        0 ||
      uploading
    ) {
      return;
    }

    const normalizedEntries =
      removeCommonTopFolder(
        entries
      );

    const byPath =
      new Map<
        string,
        UploadQueueItem
      >();

    for (
      const entry
      of normalizedEntries
    ) {
      const relativePath =
        normalizeRelativeUploadPath(
          entry.relativePath
        );

      if (!relativePath) {
        continue;
      }

      const path =
        joinPath(
          currentPath,
          relativePath
        );

      byPath.set(path, {
        id:
          crypto.randomUUID(),
        file:
          entry.file,
        path,
        status:
          "waiting",
        loadedBytes: 0,
        totalBytes:
          entry.file.size,
        progress: 0,
      });
    }

    const queue =
      Array.from(
        byPath.values()
      );

    if (
      queue.length ===
      0
    ) {
      setError(
        "No valid files were selected."
      );

      return;
    }

    canceledUploadIdsRef
      .current
      .clear();

    setUploadQueue(queue);
    setError(undefined);
    setNotice(undefined);

    void runUploadQueue(
      queue
    );
  }

  async function runUploadQueue(
    queue:
      UploadQueueItem[]
  ) {
    if (
      queue.length ===
      0
    ) {
      return;
    }

    setUploading(true);

    try {
      const batches =
        chunkArray(
          queue,
          25
        );

      for (
        const batch
        of batches
      ) {
        const activeBatch =
          batch.filter(
            (item) =>
              !canceledUploadIdsRef
                .current
                .has(
                  item.id
                )
          );

        if (
          activeBatch.length ===
          0
        ) {
          continue;
        }

        for (
          const item
          of activeBatch
        ) {
          updateUploadItem(
            item.id,
            {
              status:
                "preparing",
              error:
                undefined,
            }
          );
        }

        let prepared:
          Awaited<
            ReturnType<
              typeof prepareWebsiteFileUploadsAction
            >
          >;

        try {
          prepared =
            await prepareWebsiteFileUploadsAction(
              websiteId,
              activeBatch.map(
                (item) => ({
                  path:
                    item.path,
                  sizeBytes:
                    item.file.size,
                  contentType:
                    item.file.type ||
                    getClientContentType(
                      item.file.name
                    ),
                })
              )
            );
        } catch (
          prepareError
        ) {
          const message =
            getErrorMessage(
              prepareError,
              "Failed to prepare uploads."
            );

          for (
            const item
            of activeBatch
          ) {
            updateUploadItem(
              item.id,
              {
                status:
                  "failed",
                error:
                  message,
              }
            );
          }

          continue;
        }

        const preparedByPath =
          new Map<
            string,
            PreparedUpload
          >(
            prepared.map(
              (upload) => [
                toUiPath(
                  upload.path
                ),
                upload,
              ]
            )
          );

        const results =
          await mapWithConcurrency(
            activeBatch,
            4,
            async (item) => {
              if (
                canceledUploadIdsRef
                  .current
                  .has(
                    item.id
                  )
              ) {
                updateUploadItem(
                  item.id,
                  {
                    status:
                      "canceled",
                  }
                );

                return {
                  item,
                  success: false,
                };
              }

              const preparedUpload =
                preparedByPath.get(
                  item.path
                );

              if (
                !preparedUpload
              ) {
                updateUploadItem(
                  item.id,
                  {
                    status:
                      "failed",
                    error:
                      "Upload URL was not created.",
                  }
                );

                return {
                  item,
                  success: false,
                };
              }

              updateUploadItem(
                item.id,
                {
                  status:
                    "uploading",
                  loadedBytes: 0,
                  progress: 0,
                  error:
                    undefined,
                }
              );

              try {
                await uploadFileWithProgress(
                  item,
                  preparedUpload
                );

                updateUploadItem(
                  item.id,
                  {
                    status:
                      "finalizing",
                    loadedBytes:
                      item.totalBytes,
                    progress: 100,
                  }
                );

                return {
                  item,
                  success: true,
                };
              } catch (
                uploadError
              ) {
                const canceled =
                  isUploadCanceledError(
                    uploadError
                  ) ||
                  canceledUploadIdsRef
                    .current
                    .has(
                      item.id
                    );

                updateUploadItem(
                  item.id,
                  {
                    status:
                      canceled
                        ? "canceled"
                        : "failed",
                    error:
                      canceled
                        ? undefined
                        : getErrorMessage(
                            uploadError,
                            "Upload failed."
                          ),
                  }
                );

                return {
                  item,
                  success: false,
                };
              }
            }
          );

        const successful =
          results.filter(
            (result) =>
              result.success
          );

        if (
          successful.length ===
          0
        ) {
          continue;
        }

        try {
          const savedFiles =
            await finalizeWebsiteFileUploadsAction(
              websiteId,
              successful.map(
                (result) =>
                  result.item.path
              )
            );

          const savedByPath =
            new Map(
              savedFiles.map(
                (file) => [
                  toUiPath(
                    file.path
                  ),
                  file,
                ]
              )
            );

          for (
            const result
            of successful
          ) {
            const saved =
              savedByPath.get(
                result.item.path
              );

            if (!saved) {
              updateUploadItem(
                result.item.id,
                {
                  status:
                    "failed",
                  error:
                    "Upload completed but metadata was not saved.",
                }
              );

              continue;
            }

            const item:
              FileItem = {
              id: saved.id,
              name:
                saved.fileName,
              type: "file",
              path:
                toUiPath(
                  saved.path
                ),
              size:
                saved.sizeBytes,
              extension:
                getExtension(
                  saved.fileName
                ),
              contentType:
                saved.contentType ??
                undefined,
              updatedAt:
                saved.updatedAt,
            };

            ensureFolderPath(
              getParentPath(
                item.path
              )
            );

            addOrReplaceFile(
              getParentPath(
                item.path
              ),
              item
            );

            updateUploadItem(
              result.item.id,
              {
                status:
                  "completed",
                loadedBytes:
                  result.item
                    .totalBytes,
                progress: 100,
                error:
                  undefined,
              }
            );
          }
        } catch (
          finalizeError
        ) {
          const message =
            getErrorMessage(
              finalizeError,
              "Upload finalization failed."
            );

          for (
            const result
            of successful
          ) {
            updateUploadItem(
              result.item.id,
              {
                status:
                  "failed",
                error:
                  message,
              }
            );
          }
        }
      }
    } finally {
      setUploading(false);
    }
  }

  function uploadFileWithProgress(
    item:
      UploadQueueItem,
    prepared:
      PreparedUpload
  ) {
    return new Promise<void>(
      (
        resolve,
        reject
      ) => {
        const request =
          new XMLHttpRequest();

        uploadRequestsRef
          .current
          .set(
            item.id,
            request
          );

        request.open(
          "PUT",
          prepared.uploadUrl,
          true
        );

        request.setRequestHeader(
          "Content-Type",
          prepared.contentType
        );

        request.upload.onprogress =
          (event) => {
            if (
              !event.lengthComputable
            ) {
              return;
            }

            const loaded =
              Math.min(
                event.loaded,
                item.totalBytes
              );

            const progress =
              item.totalBytes >
              0
                ? Math.round(
                    (
                      loaded /
                      item.totalBytes
                    ) *
                      100
                  )
                : 100;

            updateUploadItem(
              item.id,
              {
                loadedBytes:
                  loaded,
                progress,
              }
            );
          };

        request.onload =
          () => {
            uploadRequestsRef
              .current
              .delete(
                item.id
              );

            if (
              request.status >=
                200 &&
              request.status <
                300
            ) {
              resolve();
              return;
            }

            reject(
              new Error(
                `R2 returned HTTP ${request.status}.`
              )
            );
          };

        request.onerror =
          () => {
            uploadRequestsRef
              .current
              .delete(
                item.id
              );

            reject(
              new Error(
                "Network error while uploading file."
              )
            );
          };

        request.onabort =
          () => {
            uploadRequestsRef
              .current
              .delete(
                item.id
              );

            reject(
              new UploadCanceledError()
            );
          };

        request.send(
          item.file
        );
      }
    );
  }

  function handleCancelUpload(
    id: string
  ) {
    canceledUploadIdsRef
      .current
      .add(id);

    const request =
      uploadRequestsRef
        .current
        .get(id);

    if (request) {
      request.abort();
      return;
    }

    updateUploadItem(
      id,
      {
        status:
          "canceled",
      }
    );
  }

  function handleCancelAllUploads() {
    for (
      const item
      of uploadQueue
    ) {
      if (
        item.status ===
          "completed" ||
        item.status ===
          "failed" ||
        item.status ===
          "canceled"
      ) {
        continue;
      }

      canceledUploadIdsRef
        .current
        .add(
          item.id
        );

      uploadRequestsRef
        .current
        .get(
          item.id
        )
        ?.abort();
    }
  }

  function handleRetryUpload(
    item:
      UploadQueueItem
  ) {
    if (uploading) {
      return;
    }

    canceledUploadIdsRef
      .current
      .delete(
        item.id
      );

    const retryItem:
      UploadQueueItem = {
      ...item,
      status:
        "waiting",
      loadedBytes: 0,
      progress: 0,
      error:
        undefined,
    };

    updateUploadItem(
      item.id,
      retryItem
    );

    void runUploadQueue([
      retryItem,
    ]);
  }

  function handleRetryFailedUploads() {
    if (uploading) {
      return;
    }

    const failed =
      uploadQueue
        .filter(
          (item) =>
            item.status ===
              "failed" ||
            item.status ===
              "canceled"
        )
        .map((item) => {
          canceledUploadIdsRef
            .current
            .delete(
              item.id
            );

          return {
            ...item,
            status:
              "waiting" as const,
            loadedBytes: 0,
            progress: 0,
            error:
              undefined,
          };
        });

    setUploadQueue(
      (previous) =>
        previous.map(
          (item) =>
            failed.find(
              (candidate) =>
                candidate.id ===
                item.id
            ) ??
            item
        )
    );

    void runUploadQueue(
      failed
    );
  }

  function updateUploadItem(
    id: string,
    patch:
      Partial<UploadQueueItem>
  ) {
    setUploadQueue(
      (previous) =>
        previous.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  ...patch,
                }
              : item
        )
    );
  }

  async function handleDelete(
    item: FileItem
  ) {
    if (
      item.type !==
        "file" ||
      deleting
    ) {
      return;
    }

    setDeleting(true);

    try {
      await deleteWebsiteFileAction(
        websiteId,
        item.path
      );

      removePathsFromFileTree([
        item.path,
      ]);

      setDeleteItem(null);
    } catch (
      deleteError
    ) {
      setError(
        getErrorMessage(
          deleteError,
          "Failed to delete file."
        )
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleBulkDelete() {
    if (
      selectedPaths.size ===
        0 ||
      bulkDeleting
    ) {
      return;
    }

    const paths =
      Array.from(
        selectedPaths
      );

    setBulkDeleting(true);

    try {
      await deleteWebsiteItemsAction(
        websiteId,
        paths
      );

      removePathsFromFileTree(
        paths
      );

      setSelectedPaths(
        new Set()
      );
    } catch (
      deleteError
    ) {
      setError(
        getErrorMessage(
          deleteError,
          "Failed to delete selected items."
        )
      );
    } finally {
      setBulkDeleting(
        false
      );
    }
  }

  function handleSelectItem(
    item: FileItem,
    selected: boolean
  ) {
    setSelectedPaths(
      (previous) => {
        const next =
          new Set(
            previous
          );

        if (selected) {
          next.add(
            item.path
          );
        } else {
          next.delete(
            item.path
          );
        }

        return next;
      }
    );
  }

  function handleSelectAllCurrent(
    selected: boolean
  ) {
    setSelectedPaths(
      (previous) => {
        const next =
          new Set(
            previous
          );

        for (
          const item
          of currentFiles
        ) {
          if (selected) {
            next.add(
              item.path
            );
          } else {
            next.delete(
              item.path
            );
          }
        }

        return next;
      }
    );
  }

  function removePathsFromFileTree(
    paths: string[]
  ) {
    setFileTree(
      (previous) => {
        const next:
          FileTree = {};

        for (
          const [
            folderPath,
            items,
          ] of Object.entries(
            previous
          )
        ) {
          if (
            folderPath !==
              "/" &&
            paths.some(
              (path) =>
                folderPath ===
                  path ||
                folderPath.startsWith(
                  `${path}/`
                )
            )
          ) {
            continue;
          }

          next[
            folderPath
          ] =
            items.filter(
              (item) =>
                !paths.some(
                  (path) =>
                    item.path ===
                      path ||
                    item.path.startsWith(
                      `${path}/`
                    )
                )
            );
        }

        return next;
      }
    );
  }

  function ensureFolderPath(
    path: string
  ) {
    if (
      path === "/"
    ) {
      return;
    }

    setFileTree(
      (previous) => {
        const next = {
          ...previous,
        };

        const parts =
          path
            .split("/")
            .filter(Boolean);

        let parent =
          "/";

        for (
          const part
          of parts
        ) {
          const folderPath =
            joinPath(
              parent,
              part
            );

          next[parent] =
            next[parent] ??
            [];

          if (
            !next[
              parent
            ].some(
              (item) =>
                item.type ===
                  "folder" &&
                item.path ===
                  folderPath
            )
          ) {
            next[parent] =
              sortItems([
                ...next[
                  parent
                ],
                {
                  id:
                    `folder:${folderPath}`,
                  name:
                    part,
                  type:
                    "folder",
                  path:
                    folderPath,
                  updatedAt:
                    new Date()
                      .toISOString(),
                },
              ]);
          }

          next[
            folderPath
          ] =
            next[
              folderPath
            ] ?? [];

          parent =
            folderPath;
        }

        return next;
      }
    );
  }

  function addOrReplaceFile(
    parentPath: string,
    item: FileItem
  ) {
    setFileTree(
      (previous) => {
        const existing =
          previous[
            parentPath
          ] ?? [];

        const next =
          existing.some(
            (candidate) =>
              candidate.path ===
              item.path
          )
            ? existing.map(
                (candidate) =>
                  candidate.path ===
                  item.path
                    ? item
                    : candidate
              )
            : [
                ...existing,
                item,
              ];

        return {
          ...previous,
          [parentPath]:
            sortItems(next),
        };
      }
    );
  }

  function replaceFileItem(
    item: FileItem
  ) {
    addOrReplaceFile(
      getParentPath(
        item.path
      ),
      item
    );
  }

  if (editingFile) {
    return (
      <div className="space-y-3">
        {error && (
          <ErrorMessage
            message={error}
          />
        )}

        <CodeEditor
          file={editingFile}
          value={editorValue}
          saving={editorSaving}
          onChange={
            setEditorValue
          }
          onSave={() => {
            void handleSave();
          }}
          onClose={() =>
            setEditingFile(
              null
            )
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {error && (
          <ErrorMessage
            message={error}
          />
        )}

        {notice && (
          <SuccessMessage
            message={notice}
          />
        )}

        <FileOperationProgress
          websiteId={
            websiteId
          }
          onOperationCompleted={async () => {
            await refreshFileTree();
          }}
        />
        {isInitialSetup &&
        projectIsEmpty ? (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-12 text-center">
              <UploadCloud className="h-8 w-8 text-[var(--primary)]" />

              <h2 className="mt-5 text-lg font-semibold">
                Upload your website files
              </h2>

              <div className="mt-6 flex gap-2">
                <Button
                  icon={
                    <Upload className="h-4 w-4" />
                  }
                  onClick={() => {
                    setUploadQueue([]);
                    setUploadOpen(true);
                  }}
                >
                  Upload Files
                </Button>

                <Button
                  variant="secondary"
                  icon={
                    <FilePlus2 className="h-4 w-4" />
                  }
                  onClick={() =>
                    setCreateFileOpen(
                      true
                    )
                  }
                >
                  New File
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <Breadcrumbs
                currentPath={
                  currentPath
                }
                onNavigate={(
                  path
                ) => {
                  setCurrentPath(
                    path
                  );

                  setSelectedPaths(
                    new Set()
                  );
                }}
              />

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={
                    <FilePlus2 className="h-4 w-4" />
                  }
                  onClick={() =>
                    setCreateFileOpen(
                      true
                    )
                  }
                >
                  New File
                </Button>

                <Button
                  size="sm"
                  icon={
                    <Upload className="h-4 w-4" />
                  }
                  onClick={() => {
                    setUploadQueue([]);
                    setUploadOpen(true);
                  }}
                >
                  Upload
                </Button>
              </div>
            </div>

            {selectedCount >
              0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckSquare2 className="h-4 w-4 text-[var(--primary)]" />

                  <span className="font-medium">
                    {selectedCount} selected
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPaths(
                        new Set()
                      )
                    }
                    className="ml-2 text-[var(--muted-foreground)]"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={
                      bulkDownloading
                    }
                    icon={
                      <Download className="h-4 w-4" />
                    }
                    onClick={() => {
                      void handleBulkDownloadZip();
                    }}
                  >
                    Download ZIP
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    icon={
                      <Archive className="h-4 w-4" />
                    }
                    onClick={
                      handleBulkCompress
                    }
                  >
                    Compress
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    icon={
                      <FolderInput className="h-4 w-4" />
                    }
                    onClick={
                      handleBulkMove
                    }
                  >
                    Move
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    icon={
                      <Copy className="h-4 w-4" />
                    }
                    onClick={
                      handleBulkCopy
                    }
                  >
                    Copy
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    loading={
                      bulkDeleting
                    }
                    icon={
                      <Trash2 className="h-4 w-4" />
                    }
                    onClick={() => {
                      void handleBulkDelete();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-visible rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              <div className="grid grid-cols-[36px_minmax(0,1fr)_100px_150px_40px] items-center gap-3 rounded-t-lg border-b border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                <input
                  type="checkbox"
                  checked={
                    allCurrentSelected
                  }
                  ref={(input) => {
                    if (input) {
                      input.indeterminate =
                        someCurrentSelected &&
                        !allCurrentSelected;
                    }
                  }}
                  onChange={(event) =>
                    handleSelectAllCurrent(
                      event.target
                        .checked
                    )
                  }
                  className="h-4 w-4 accent-[var(--primary)]"
                />

                <div>Name</div>
                <div>Size</div>
                <div>Modified</div>
                <div />
              </div>

              {currentFiles.map(
                (item) => (
                  <FileRow
                    key={item.id}
                    item={item}
                    selected={
                      selectedPaths.has(
                        item.path
                      )
                    }
                    onSelect={
                      handleSelectItem
                    }
                    onOpen={
                      handleOpen
                    }
                    onRename={
                      handleRenameItem
                    }
                    onMove={
                      handleMoveItem
                    }
                    onCopy={
                      handleCopyItem
                    }
                    onDownload={
                      item.type ===
                      "file"
                        ? handleDownload
                        : undefined
                    }
                    onCompress={
                      handleCompressItem
                    }
                    onExtractHere={
                      isZipFile(
                        item
                      )
                        ? handleExtractHere
                        : undefined
                    }
                    onExtractTo={
                      isZipFile(
                        item
                      )
                        ? handleExtractTo
                        : undefined
                    }
                    onDelete={
                      item.type ===
                      "file"
                        ? setDeleteItem
                        : undefined
                    }
                  />
                )
              )}
            </div>
          </>
        )}
      </div>

      <CreateFileModal
        open={createFileOpen}
        onClose={() =>
          setCreateFileOpen(
            false
          )
        }
        onCreate={(name) => {
          void handleCreateFile(
            name
          );
        }}
      />

      <DeleteItemModal
        open={
          deleteItem !== null
        }
        item={deleteItem}
        loading={deleting}
        onClose={() =>
          setDeleteItem(null)
        }
        onConfirm={(item) => {
          void handleDelete(
            item
          );
        }}
      />

      <ExtractArchiveModal
        open={
          extractItem !== null
        }
        item={extractItem}
        defaultDestination={
          extractItem
            ? getParentPath(
                extractItem.path
              )
            : currentPath
        }
        destinationLocked={
          extractMode ===
          "here"
        }
        loading={extracting}
        onClose={() =>
          setExtractItem(null)
        }
        onExtract={(options) => {
          void handleExtractArchive(
            options
          );
        }}
      />

      <CompressArchiveModal
        open={compressOpen}
        itemCount={
          compressPaths.length
        }
        defaultArchiveName={
          compressName
        }
        defaultDestination={
          compressDestination
        }
        loading={compressing}
        onClose={() =>
          setCompressOpen(
            false
          )
        }
        onCompress={(options) => {
          void handleCompressArchive(
            options
          );
        }}
      />

      <ItemOperationModal
        open={
          operationItem !==
          null
        }
        mode={
          operationMode
        }
        item={
          operationItem
        }
        loading={
          operating
        }
        onClose={() => {
          if (!operating) {
            setOperationItem(
              null
            );
          }
        }}
        onSubmit={(input) => {
          void handleItemOperation(
            input
          );
        }}
      />

      <BulkItemOperationModal
        open={
          bulkOperationOpen
        }
        mode={
          bulkOperationMode
        }
        itemCount={
          selectedCount
        }
        defaultDestination={
          currentPath
        }
        loading={
          bulkOperating
        }
        onClose={() => {
          if (!bulkOperating) {
            setBulkOperationOpen(
              false
            );
          }
        }}
        onSubmit={(input) => {
          void handleBulkItemOperation(
            input
          );
        }}
      />

      {uploadOpen && (
        <UploadModal
          queue={uploadQueue}
          uploading={uploading}
          onClose={() => {
            if (!uploading) {
              setUploadOpen(false);
            }
          }}
          onFiles={
            handleUploadSelection
          }
          onCancelAll={
            handleCancelAllUploads
          }
          onCancelItem={
            handleCancelUpload
          }
          onRetryItem={
            handleRetryUpload
          }
          onRetryFailed={
            handleRetryFailedUploads
          }
        />
      )}
    </>
  );
}

function UploadModal({
  queue,
  uploading,
  onClose,
  onFiles,
  onCancelAll,
  onCancelItem,
  onRetryItem,
  onRetryFailed,
}: {
  queue:
    UploadQueueItem[];
  uploading: boolean;
  onClose: () => void;
  onFiles: (
    files:
      UploadFileEntry[]
  ) => void;
  onCancelAll: () => void;
  onCancelItem: (
    id: string
  ) => void;
  onRetryItem: (
    item:
      UploadQueueItem
  ) => void;
  onRetryFailed: () => void;
}) {
  const totalBytes =
    queue.reduce(
      (sum, item) =>
        sum +
        item.totalBytes,
      0
    );

  const loadedBytes =
    queue.reduce(
      (sum, item) =>
        sum +
        Math.min(
          item.loadedBytes,
          item.totalBytes
        ),
      0
    );

  const progress =
    totalBytes >
    0
      ? Math.round(
          (
            loadedBytes /
            totalBytes
          ) *
            100
        )
      : 0;

  const completed =
    queue.filter(
      (item) =>
        item.status ===
        "completed"
    ).length;

  const failed =
    queue.filter(
      (item) =>
        item.status ===
          "failed" ||
        item.status ===
          "canceled"
    ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        disabled={uploading}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="font-semibold">
              Upload Files
            </h2>

            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Direct browser to Embernix storage.
            </p>
          </div>

          {!uploading && (
            <button
              type="button"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {queue.length ===
          0 ? (
            <UploadDropzone
              onFiles={onFiles}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex justify-between text-sm">
                  <span>
                    {completed} /{" "}
                    {queue.length}
                  </span>

                  <span>
                    {progress}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
                  <div
                    className="h-full bg-[var(--primary)]"
                    style={{
                      width:
                        `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {queue.map(
                (item) => (
                  <UploadQueueRow
                    key={item.id}
                    item={item}
                    uploading={
                      uploading
                    }
                    onCancel={() =>
                      onCancelItem(
                        item.id
                      )
                    }
                    onRetry={() =>
                      onRetryItem(
                        item
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between border-t border-[var(--border)] px-5 py-4">
          <div>
            {failed >
              0 &&
              !uploading && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={
                    <RotateCcw className="h-4 w-4" />
                  }
                  onClick={
                    onRetryFailed
                  }
                >
                  Retry Failed
                </Button>
              )}
          </div>

          {uploading ? (
            <Button
              size="sm"
              variant="danger"
              onClick={
                onCancelAll
              }
            >
              Cancel
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={onClose}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadQueueRow({
  item,
  uploading,
  onCancel,
  onRetry,
}: {
  item:
    UploadQueueItem;
  uploading: boolean;
  onCancel: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <div className="flex justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {item.path}
          </p>

          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {item.status} •{" "}
            {item.progress}%
          </p>

          {item.status ===
            "uploading" && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-strong)]">
              <div
                className="h-full bg-[var(--primary)]"
                style={{
                  width:
                    `${item.progress}%`,
                }}
              />
            </div>
          )}

          {item.error && (
            <p className="mt-2 text-xs text-[var(--danger)]">
              {item.error}
            </p>
          )}
        </div>

        {uploading &&
          item.status !==
            "completed" && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[var(--muted-foreground)]"
            >
              Cancel
            </button>
          )}

        {!uploading &&
          (
            item.status ===
              "failed" ||
            item.status ===
              "canceled"
          ) && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs text-[var(--primary)]"
            >
              Retry
            </button>
          )}
      </div>
    </div>
  );
}

function Breadcrumbs({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (
    path: string
  ) => void;
}) {
  const parts =
    currentPath
      .split("/")
      .filter(Boolean);

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        type="button"
        onClick={() =>
          onNavigate("/")
        }
      >
        <Home className="h-4 w-4" />
      </button>

      {parts.map(
        (
          part,
          index
        ) => {
          const path =
            `/${parts
              .slice(
                0,
                index + 1
              )
              .join("/")}`;

          return (
            <div
              key={path}
              className="flex items-center"
            >
              <ChevronRight className="mx-1 h-4 w-4" />

              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    path
                  )
                }
              >
                {part}
              </button>
            </div>
          );
        }
      )}
    </div>
  );
}

function buildFileTree(
  records:
    WebsiteFileRecord[]
): FileTree {
  const tree:
    FileTree = {
    "/": [],
  };

  for (
    const record
    of records
  ) {
    const cleanPath =
      record.path
        .replace(
          /\\/g,
          "/"
        )
        .replace(
          /^\/+/,
          ""
        );

    const parts =
      cleanPath
        .split("/")
        .filter(Boolean);

    if (
      parts.length ===
      0
    ) {
      continue;
    }

    let parent = "/";

    for (
      let i = 0;
      i <
      parts.length - 1;
      i++
    ) {
      const name =
        parts[i];

      const path =
        joinPath(
          parent,
          name
        );

      tree[parent] =
        tree[parent] ??
        [];

      if (
        !tree[
          parent
        ].some(
          (item) =>
            item.type ===
              "folder" &&
            item.path ===
              path
        )
      ) {
        tree[parent].push({
          id:
            `folder:${path}`,
          name,
          type:
            "folder",
          path,
          updatedAt:
            record.updated_at,
        });
      }

      tree[path] =
        tree[path] ??
        [];

      parent = path;
    }

    const name =
      parts[
        parts.length - 1
      ];

    tree[parent] =
      tree[parent] ??
      [];

    tree[parent].push({
      id: record.id,
      name,
      type: "file",
      path:
        toUiPath(
          cleanPath
        ),
      size:
        Number(
          record.size_bytes
        ),
      extension:
        getExtension(name),
      contentType:
        record.content_type ??
        undefined,
      updatedAt:
        record.updated_at,
    });
  }

  for (
    const path
    of Object.keys(
      tree
    )
  ) {
    tree[path] =
      sortItems(
        tree[path]
      );
  }

  return tree;
}

function joinPath(
  parent: string,
  name: string
) {
  const clean =
    name
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /^\/+/,
        ""
      );

  return parent === "/"
    ? `/${clean}`
    : `${parent}/${clean}`;
}

function normalizeUiDirectory(
  path: string
) {
  const clean =
    path
      .trim()
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /\/+/g,
        "/"
      );

  if (
    !clean ||
    clean === "/"
  ) {
    return "/";
  }

  return `/${clean.replace(
    /^\/+/,
    ""
  )}`;
}

function getParentPath(
  path: string
) {
  const parts =
    path
      .split("/")
      .filter(Boolean);

  parts.pop();

  return parts.length
    ? `/${parts.join("/")}`
    : "/";
}

function getBaseName(
  path: string
) {
  return path
    .split("/")
    .filter(Boolean)
    .pop() ?? "item";
}

function toUiPath(
  path: string
) {
  return `/${path.replace(
    /^\/+/,
    ""
  )}`;
}

function getExtension(
  name: string
) {
  return name.includes(".")
    ? name
        .split(".")
        .pop()
        ?.toLowerCase()
    : undefined;
}

function stripExtension(
  name: string
) {
  const index =
    name.lastIndexOf(".");

  if (
    index <= 0
  ) {
    return name;
  }

  return name.slice(
    0,
    index
  );
}

function ensureZipExtension(
  value: string
) {
  return value
    .toLowerCase()
    .endsWith(".zip")
    ? value
    : `${value}.zip`;
}

function isZipFile(
  item: FileItem
) {
  return (
    item.type ===
      "file" &&
    (
      item.extension ===
        "zip" ||
      item.name
        .toLowerCase()
        .endsWith(".zip")
    )
  );
}

function normalizeFileName(
  value: string
) {
  return value
    .trim()
    .replace(
      /[\\/]/g,
      "-"
    );
}

function normalizeRelativeUploadPath(
  value: string
) {
  const path =
    value
      .replace(
        /\\/g,
        "/"
      )
      .replace(
        /^\/+/,
        ""
      );

  if (
    !path ||
    path.includes(
      "../"
    )
  ) {
    return null;
  }

  return path;
}

function removeCommonTopFolder(
  entries:
    UploadFileEntry[]
) {
  if (!entries.length) {
    return entries;
  }

  const paths =
    entries.map(
      (entry) =>
        entry.relativePath
          .replace(
            /\\/g,
            "/"
          )
    );

  if (
    paths.some(
      (path) =>
        !path.includes("/")
    )
  ) {
    return entries;
  }

  const first =
    paths[0].split(
      "/"
    )[0];

  if (
    !paths.every(
      (path) =>
        path.split(
          "/"
        )[0] === first
    )
  ) {
    return entries;
  }

  return entries.map(
    (
      entry,
      index
    ) => ({
      ...entry,
      relativePath:
        paths[index]
          .split("/")
          .slice(1)
          .join("/"),
    })
  );
}

function isEditableFile(
  item: FileItem
) {
  return new Set([
    "txt",
    "md",
    "html",
    "css",
    "js",
    "jsx",
    "ts",
    "tsx",
    "json",
    "xml",
    "svg",
    "yml",
    "yaml",
    "env",
    "php",
    "py",
    "java",
    "go",
    "rs",
    "sh",
    "sql",
  ]).has(
    item.extension ??
      ""
  );
}

function getClientContentType(
  name: string
) {
  const ext =
    getExtension(name);

  if (
    ext === "zip"
  ) {
    return "application/zip";
  }

  if (
    ext === "png"
  ) {
    return "image/png";
  }

  if (
    ext === "jpg" ||
    ext === "jpeg"
  ) {
    return "image/jpeg";
  }

  return "application/octet-stream";
}

function sortItems(
  items: FileItem[]
) {
  return [
    ...items,
  ].sort(
    (
      a,
      b
    ) => {
      if (
        a.type !== b.type
      ) {
        return a.type ===
          "folder"
          ? -1
          : 1;
      }

      return a.name.localeCompare(
        b.name
      );
    }
  );
}

function chunkArray<T>(
  values: T[],
  size: number
) {
  const chunks:
    T[][] = [];

  for (
    let i = 0;
    i <
    values.length;
    i += size
  ) {
    chunks.push(
      values.slice(
        i,
        i + size
      )
    );
  }

  return chunks;
}

async function mapWithConcurrency<
  T,
  R,
>(
  values: T[],
  limit: number,
  worker: (
    value: T
  ) => Promise<R>
) {
  const results:
    R[] =
    new Array(
      values.length
    );

  let index = 0;

  async function runner() {
    while (
      index <
      values.length
    ) {
      const current =
        index++;

      results[
        current
      ] =
        await worker(
          values[current]
        );
    }
  }

  await Promise.all(
    Array.from(
      {
        length:
          Math.min(
            limit,
            values.length
          ),
      },
      runner
    )
  );

  return results;
}

async function downloadSignedFile(
  url: string,
  fileName: string
) {
  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Download failed with HTTP ${response.status}.`
    );
  }

  const blob =
    await response.blob();

  const objectUrl =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href =
    objectUrl;

  anchor.download =
    fileName;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(
    objectUrl
  );
}

class UploadCanceledError
  extends Error {
  constructor() {
    super(
      "Upload canceled."
    );

    this.name =
      "UploadCanceledError";
  }
}

function isUploadCanceledError(
  error: unknown
) {
  return (
    error instanceof
      UploadCanceledError ||
    (
      error instanceof
        Error &&
      error.name ===
        "UploadCanceledError"
    )
  );
}

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--danger)]/30 px-4 py-3 text-sm text-[var(--danger)]">
      {message}
    </div>
  );
}

function SuccessMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
      {message}
    </div>
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  return error instanceof
    Error
    ? error.message
    : fallback;
}