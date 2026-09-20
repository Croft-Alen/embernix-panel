export type BuildStatus =
  | "queued"
  | "building"
  | "success"
  | "failed"
  | "cancelled";

export type BuildStageStatus =
  | "pending"
  | "running"
  | "success"
  | "failed";

export type BuildStage = {
  id: string;
  label: string;
  status: BuildStageStatus;
};

export type BuildLogLine = {
  id: string;
  timestamp: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
};

export type Build = {
  id: string;
  number: number;
  websiteId: string;

  status: BuildStatus;

  environment: "production" | "preview";

  branch: string;

  framework: string;

  startedAt: string;

  finishedAt?: string;

  durationSeconds?: number;

  commit?: string;

  stages: BuildStage[];

  logs: BuildLogLine[];
};