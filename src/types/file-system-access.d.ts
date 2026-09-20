interface DataTransferItem {
  webkitGetAsEntry?():
    | FileSystemEntry
    | null;
}

interface FileSystemEntry {
  readonly isFile:
    boolean;

  readonly isDirectory:
    boolean;

  readonly name:
    string;

  readonly fullPath:
    string;
}

interface FileSystemFileEntry
  extends FileSystemEntry {
  file(
    successCallback: (
      file: File
    ) => void,
    errorCallback?: (
      error:
        DOMException
    ) => void
  ): void;
}

interface FileSystemDirectoryEntry
  extends FileSystemEntry {
  createReader():
    FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
  readEntries(
    successCallback: (
      entries:
        FileSystemEntry[]
    ) => void,
    errorCallback?: (
      error:
        DOMException
    ) => void
  ): void;
}