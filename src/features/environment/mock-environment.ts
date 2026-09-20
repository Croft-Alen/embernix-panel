import type {
  EnvironmentVariable,
} from "@/features/environment/types";

export const mockEnvironmentVariables: EnvironmentVariable[] = [
  {
    id: "env_01",

    websiteId:
      "site_01",

    key:
      "NEXT_PUBLIC_API_URL",

    value:
      "https://api.croftstudio.online",

    target:
      "both",

    createdAt:
      "2026-09-17T10:00:00.000Z",

    updatedAt:
      "2026-09-17T10:00:00.000Z",
  },

  {
    id: "env_02",

    websiteId:
      "site_01",

    key:
      "DATABASE_URL",

    value:
      "postgresql://embernix:example@db.internal:5432/croft",

    target:
      "production",

    createdAt:
      "2026-09-17T10:05:00.000Z",

    updatedAt:
      "2026-09-17T10:05:00.000Z",
  },

  {
    id: "env_03",

    websiteId:
      "site_01",

    key:
      "API_TOKEN",

    value:
      "emb_test_01A9B8C7D6E5F4",

    target:
      "production",

    createdAt:
      "2026-09-17T10:10:00.000Z",

    updatedAt:
      "2026-09-18T07:30:00.000Z",
  },

  {
    id: "env_04",

    websiteId:
      "site_01",

    key:
      "PREVIEW_API_URL",

    value:
      "https://preview-api.croftstudio.online",

    target:
      "preview",

    createdAt:
      "2026-09-17T11:00:00.000Z",

    updatedAt:
      "2026-09-17T11:00:00.000Z",
  },
];