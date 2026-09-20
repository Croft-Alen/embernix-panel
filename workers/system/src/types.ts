export type FileOperationKind =
  | "extract_zip"
  | "create_zip"
  | "move_items"
  | "copy_items";

export type FileOperationStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "canceled";

export type FileOperationRecord = {
  id: string;
  website_id: string;
  created_by: string;
  kind: FileOperationKind;
  status: FileOperationStatus;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  progress_current: number;
  progress_total: number;
  progress_percent: number;
  progress_message: string | null;
  error_message: string | null;
  cancel_requested: boolean;
  worker_id: string | null;
  attempt_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

export type WebsiteFileRecord = {
  id: string;
  website_id: string;
  path: string;
  object_key: string;
  file_name: string;
  content_type: string | null;
  size_bytes: number;
  etag: string | null;
  checksum_sha256: string | null;
  created_at: string;
  updated_at: string;
};

export type SystemQueueMessage =
  | {
      type: "ping";
      createdAt: string;
      message: string;
    }
  | {
      type: "file_operation";
      operationId: string;
    };

export interface Env {
  FILES_BUCKET: R2Bucket;

  FILE_OPERATIONS_QUEUE:
    Queue<SystemQueueMessage>;

  EMBERNIX_INTERNAL_SECRET:
    string;

  SUPABASE_URL:
    string;

  SUPABASE_SERVICE_ROLE_KEY:
    string;
}