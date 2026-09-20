import type {
  Deployment,
} from "@/features/deployments/types";

export const mockDeployments: Deployment[] = [
  {
    id: "deployment_204",

    number: 204,

    websiteId:
      "site_01",

    buildId:
      "build_104",

    buildNumber:
      104,

    status:
      "ready",

    environment:
      "production",

    branch:
      "main",

    commit:
      "f8a31c2",

    createdAt:
      "2026-09-18T11:22:40.000Z",

    finishedAt:
      "2026-09-18T11:23:15.000Z",

    durationSeconds:
      35,

    domains: [
      "croftstudio.online",
      "croft-studio.embernix.site",
    ],

    steps: [
      {
        id:
          "prepare",
        label:
          "Preparing deployment",
        status:
          "success",
      },
      {
        id:
          "upload",
        label:
          "Uploading assets",
        status:
          "success",
      },
      {
        id:
          "publish",
        label:
          "Publishing application",
        status:
          "success",
      },
      {
        id:
          "domains",
        label:
          "Assigning domains",
        status:
          "success",
      },
      {
        id:
          "ready",
        label:
          "Deployment ready",
        status:
          "success",
      },
    ],
  },

  {
    id:
      "deployment_203",

    number:
      203,

    websiteId:
      "site_01",

    buildId:
      "build_103",

    buildNumber:
      103,

    status:
      "failed",

    environment:
      "production",

    branch:
      "main",

    commit:
      "ac91e53",

    createdAt:
      "2026-09-18T09:10:16.000Z",

    finishedAt:
      "2026-09-18T09:10:24.000Z",

    durationSeconds:
      8,

    domains: [
      "croftstudio.online",
    ],

    steps: [
      {
        id:
          "prepare",
        label:
          "Preparing deployment",
        status:
          "success",
      },
      {
        id:
          "upload",
        label:
          "Uploading assets",
        status:
          "failed",
      },
      {
        id:
          "publish",
        label:
          "Publishing application",
        status:
          "pending",
      },
      {
        id:
          "domains",
        label:
          "Assigning domains",
        status:
          "pending",
      },
      {
        id:
          "ready",
        label:
          "Deployment ready",
        status:
          "pending",
      },
    ],
  },

  {
    id:
      "deployment_202",

    number:
      202,

    websiteId:
      "site_01",

    buildId:
      "build_102",

    buildNumber:
      102,

    status:
      "ready",

    environment:
      "production",

    branch:
      "main",

    commit:
      "91d2bc7",

    createdAt:
      "2026-09-17T15:45:43.000Z",

    finishedAt:
      "2026-09-17T15:46:20.000Z",

    durationSeconds:
      37,

    domains: [
      "croftstudio.online",
      "croft-studio.embernix.site",
    ],

    steps: [
      {
        id:
          "prepare",
        label:
          "Preparing deployment",
        status:
          "success",
      },
      {
        id:
          "upload",
        label:
          "Uploading assets",
        status:
          "success",
      },
      {
        id:
          "publish",
        label:
          "Publishing application",
        status:
          "success",
      },
      {
        id:
          "domains",
        label:
          "Assigning domains",
        status:
          "success",
      },
      {
        id:
          "ready",
        label:
          "Deployment ready",
        status:
          "success",
      },
    ],
  },
];