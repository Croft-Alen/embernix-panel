import type {
  Build,
} from "@/features/builds/types";

export const mockBuilds: Build[] = [
  {
    id: "build_104",
    number: 104,
    websiteId: "site_01",

    status: "success",

    environment: "production",

    branch: "main",

    framework: "Next.js 16.3.5",

    startedAt:
      "2026-09-18T11:22:00.000Z",

    finishedAt:
      "2026-09-18T11:22:38.000Z",

    durationSeconds: 38,

    commit: "f8a31c2",

    stages: [
      {
        id: "prepare",
        label: "Preparing",
        status: "success",
      },
      {
        id: "dependencies",
        label: "Installing dependencies",
        status: "success",
      },
      {
        id: "build",
        label: "Building application",
        status: "success",
      },
      {
        id: "upload",
        label: "Uploading assets",
        status: "success",
      },
      {
        id: "ready",
        label: "Deployment ready",
        status: "success",
      },
    ],

    logs: [
      {
        id: "log_1",
        timestamp:
          "2026-09-18T11:22:00.000Z",
        message:
          "Preparing build environment...",
        type: "info",
      },
      {
        id: "log_2",
        timestamp:
          "2026-09-18T11:22:03.000Z",
        message:
          "Installing dependencies...",
        type: "info",
      },
      {
        id: "log_3",
        timestamp:
          "2026-09-18T11:22:14.000Z",
        message:
          "Dependencies installed successfully.",
        type: "success",
      },
      {
        id: "log_4",
        timestamp:
          "2026-09-18T11:22:15.000Z",
        message:
          "Running next build...",
        type: "info",
      },
      {
        id: "log_5",
        timestamp:
          "2026-09-18T11:22:29.000Z",
        message:
          "Application compiled successfully.",
        type: "success",
      },
      {
        id: "log_6",
        timestamp:
          "2026-09-18T11:22:31.000Z",
        message:
          "Uploading static assets...",
        type: "info",
      },
      {
        id: "log_7",
        timestamp:
          "2026-09-18T11:22:38.000Z",
        message:
          "Build completed successfully.",
        type: "success",
      },
    ],
  },

  {
    id: "build_103",
    number: 103,
    websiteId: "site_01",

    status: "failed",

    environment: "production",

    branch: "main",

    framework: "Next.js 16.3.5",

    startedAt:
      "2026-09-18T09:10:00.000Z",

    finishedAt:
      "2026-09-18T09:10:14.000Z",

    durationSeconds: 14,

    commit: "ac91e53",

    stages: [
      {
        id: "prepare",
        label: "Preparing",
        status: "success",
      },
      {
        id: "dependencies",
        label: "Installing dependencies",
        status: "success",
      },
      {
        id: "build",
        label: "Building application",
        status: "failed",
      },
      {
        id: "upload",
        label: "Uploading assets",
        status: "pending",
      },
      {
        id: "ready",
        label: "Deployment ready",
        status: "pending",
      },
    ],

    logs: [
      {
        id: "log_1",
        timestamp:
          "2026-09-18T09:10:00.000Z",
        message:
          "Preparing build environment...",
        type: "info",
      },
      {
        id: "log_2",
        timestamp:
          "2026-09-18T09:10:03.000Z",
        message:
          "Installing dependencies...",
        type: "info",
      },
      {
        id: "log_3",
        timestamp:
          "2026-09-18T09:10:09.000Z",
        message:
          "Running next build...",
        type: "info",
      },
      {
        id: "log_4",
        timestamp:
          "2026-09-18T09:10:14.000Z",
        message:
          "Build failed: module not found.",
        type: "error",
      },
    ],
  },

  {
    id: "build_102",
    number: 102,
    websiteId: "site_01",

    status: "success",

    environment: "production",

    branch: "main",

    framework: "Next.js 16.3.5",

    startedAt:
      "2026-09-17T15:45:00.000Z",

    finishedAt:
      "2026-09-17T15:45:41.000Z",

    durationSeconds: 41,

    commit: "91d2bc7",

    stages: [
      {
        id: "prepare",
        label: "Preparing",
        status: "success",
      },
      {
        id: "dependencies",
        label: "Installing dependencies",
        status: "success",
      },
      {
        id: "build",
        label: "Building application",
        status: "success",
      },
      {
        id: "upload",
        label: "Uploading assets",
        status: "success",
      },
      {
        id: "ready",
        label: "Deployment ready",
        status: "success",
      },
    ],

    logs: [
      {
        id: "log_1",
        timestamp:
          "2026-09-17T15:45:00.000Z",
        message:
          "Preparing build environment...",
        type: "info",
      },
      {
        id: "log_2",
        timestamp:
          "2026-09-17T15:45:07.000Z",
        message:
          "Installing dependencies...",
        type: "info",
      },
      {
        id: "log_3",
        timestamp:
          "2026-09-17T15:45:19.000Z",
        message:
          "Building application...",
        type: "info",
      },
      {
        id: "log_4",
        timestamp:
          "2026-09-17T15:45:34.000Z",
        message:
          "Uploading deployment assets...",
        type: "info",
      },
      {
        id: "log_5",
        timestamp:
          "2026-09-17T15:45:41.000Z",
        message:
          "Build completed successfully.",
        type: "success",
      },
    ],
  },
];