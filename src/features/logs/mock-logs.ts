import type {
  RuntimeLog,
} from "@/features/logs/types";

export const mockRuntimeLogs: RuntimeLog[] = [
  {
    id: "log_001",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:42:10.000Z",

    level:
      "info",

    environment:
      "production",

    source:
      "GET /api/user",

    message:
      "Request completed successfully.",

    metadata:
      "200 · 83ms",
  },

  {
    id: "log_002",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:42:12.000Z",

    level:
      "info",

    environment:
      "production",

    source:
      "GET /",

    message:
      "Page request completed.",

    metadata:
      "200 · 41ms",
  },

  {
    id: "log_003",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:42:15.000Z",

    level:
      "warning",

    environment:
      "production",

    source:
      "GET /api/orders",

    message:
      "Slow request detected.",

    metadata:
      "200 · 1240ms",
  },

  {
    id: "log_004",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:42:18.000Z",

    level:
      "error",

    environment:
      "production",

    source:
      "database",

    message:
      "Database connection failed.",

    metadata:
      "Connection timeout",
  },

  {
    id: "log_005",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:43:02.000Z",

    level:
      "debug",

    environment:
      "production",

    source:
      "auth",

    message:
      "Session token refreshed.",

    metadata:
      "user-session",
  },

  {
    id: "log_006",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:45:10.000Z",

    level:
      "info",

    environment:
      "preview",

    source:
      "GET /",

    message:
      "Preview page request completed.",

    metadata:
      "200 · 52ms",
  },

  {
    id: "log_007",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:45:14.000Z",

    level:
      "warning",

    environment:
      "preview",

    source:
      "runtime",

    message:
      "Environment variable is not set.",

    metadata:
      "PREVIEW_ANALYTICS_ID",
  },

  {
    id: "log_008",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:46:22.000Z",

    level:
      "error",

    environment:
      "preview",

    source:
      "POST /api/contact",

    message:
      "Request handler threw an exception.",

    metadata:
      "500 · 117ms",
  },

  {
    id: "log_009",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:47:02.000Z",

    level:
      "info",

    environment:
      "production",

    source:
      "GET /products",

    message:
      "Page rendered successfully.",

    metadata:
      "200 · 64ms",
  },

  {
    id: "log_010",

    websiteId:
      "site_01",

    timestamp:
      "2026-09-18T11:48:31.000Z",

    level:
      "debug",

    environment:
      "preview",

    source:
      "cache",

    message:
      "Cache entry created.",

    metadata:
      "products:list",
  },
];