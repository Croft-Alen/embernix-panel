export type PackageManager =
  | "npm"
  | "pnpm"
  | "yarn"
  | "bun";

export type WebsiteSettings = {
  websiteId: string;

  name: string;

  subdomain: string;

  framework: string;

  productionBranch: string;

  installCommand: string;

  buildCommand: string;

  outputDirectory: string;

  nodeVersion: string;

  packageManager: PackageManager;

  autoDeploy: boolean;
};