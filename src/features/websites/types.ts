import type {
  SetupProgressStatus,
} from "@/features/setup/types";

export type WebsiteOperationalStatus =
  | "online"
  | "building"
  | "failed"
  | "offline"
  | "suspended";

export type DashboardWebsite = {
  id: string;

  name: string;

  domain: string;

  framework?: string;

  status: WebsiteOperationalStatus;

  setupStatus: SetupProgressStatus;

  storage: string;

  publishedAt?: string;

  publicUrl?: string;
};