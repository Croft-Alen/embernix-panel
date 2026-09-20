import type {
  Backup,
} from "@/features/backups/types";

export const mockBackups: Backup[] = [
  {
    id: "backup_12",

    websiteId:
      "site_01",

    number:
      12,

    name:
      "Before homepage update",

    status:
      "completed",

    type:
      "manual",

    sizeBytes:
      195035136,

    createdAt:
      "2026-09-18T13:20:00.000Z",

    completedAt:
      "2026-09-18T13:21:12.000Z",
  },

  {
    id: "backup_11",

    websiteId:
      "site_01",

    number:
      11,

    status:
      "completed",

    type:
      "automatic",

    sizeBytes:
      190840832,

    createdAt:
      "2026-09-17T16:10:00.000Z",

    completedAt:
      "2026-09-17T16:11:05.000Z",
  },

  {
    id: "backup_10",

    websiteId:
      "site_01",

    number:
      10,

    name:
      "Manual backup",

    status:
      "failed",

    type:
      "manual",

    createdAt:
      "2026-09-16T15:45:00.000Z",
  },
];