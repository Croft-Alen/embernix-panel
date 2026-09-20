export type DeploymentStatus =
  | "queued"
  | "deploying"
  | "ready"
  | "failed"
  | "cancelled";

export type DeploymentStepStatus =
  | "pending"
  | "running"
  | "success"
  | "failed";

export type DeploymentStep = {
  id: string;
  label: string;
  status: DeploymentStepStatus;
};

export type Deployment = {
  id: string;
  number: number;

  websiteId: string;

  buildId?: string;
  buildNumber?: number;

  status: DeploymentStatus;

  environment:
    | "production"
    | "preview";

  branch: string;

  commit?: string;

  createdAt: string;

  finishedAt?: string;

  durationSeconds?: number;

  domains: string[];

  steps: DeploymentStep[];
};