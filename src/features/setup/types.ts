export type SetupSource =
  | "upload"
  | "github";

export type DetectedFramework =
  | "nextjs"
  | "react"
  | "astro"
  | "nuxt"
  | "sveltekit"
  | "vue"
  | "static"
  | "unknown";

export type DetectedProject = {
  framework: DetectedFramework;
  frameworkLabel: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
};

export type SetupStep =
  | "source"
  | "upload"
  | "detect"
  | "review"
  | "deploy";

export type DeploymentStage =
  | "idle"
  | "preparing"
  | "building"
  | "deploying"
  | "ready"
  | "failed";

export type SetupProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type WebsiteSetupProgress = {
  websiteId: string;
  status: SetupProgressStatus;
  currentStep: SetupStep;
  source?: SetupSource;
  uploadedFileName?: string;
  repositoryUrl?: string;
  detectedProject?: DetectedProject;
  completedAt?: string;
};

export type WebsiteSetupState = {
  websiteId: string;
  source?: SetupSource;
  uploadedFileName?: string;
  repositoryUrl?: string;
  detectedProject?: DetectedProject;
};