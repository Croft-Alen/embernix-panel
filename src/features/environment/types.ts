export type EnvironmentTarget =
  | "production"
  | "preview"
  | "both";

export type EnvironmentVariable = {
  id: string;

  websiteId: string;

  key: string;

  value: string;

  target: EnvironmentTarget;

  createdAt: string;

  updatedAt: string;
};