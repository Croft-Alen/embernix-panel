export type LogLevel =
  | "info"
  | "warning"
  | "error"
  | "debug";

export type LogEnvironment =
  | "production"
  | "preview";

export type RuntimeLog = {
  id: string;

  websiteId: string;

  timestamp: string;

  level: LogLevel;

  environment: LogEnvironment;

  source: string;

  message: string;

  metadata?: string;
};