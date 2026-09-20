export type BackupStatus =
  | "creating"
  | "completed"
  | "failed";

export type BackupType =
  | "manual"
  | "automatic";

export type Backup = {
  id: string;

  websiteId: string;

  number: number;

  name?: string;

  status: BackupStatus;

  type: BackupType;

  sizeBytes?: number;

  createdAt: string;

  completedAt?: string;
};