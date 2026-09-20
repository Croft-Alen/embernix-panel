export type FileItemType =
  | "file"
  | "folder";

export type FileItem = {
  id: string;

  name: string;

  type: FileItemType;

  path: string;

  size?: number;

  extension?: string;

  contentType?: string;

  updatedAt: string;

  content?: string;
};

export type FileTree = Record<
  string,
  FileItem[]
>;