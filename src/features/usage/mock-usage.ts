import type {
  WebsiteUsage,
} from "@/features/usage/types";

export const mockUsage: WebsiteUsage[] = [
  {
    websiteId:
      "site_01",

    bandwidth: {
      used:
        13314398617,
      limit:
        107374182400,
    },

    storage: {
      used:
        195035136,
      limit:
        1073741824,
    },

    buildMinutes: {
      used:
        48,
      limit:
        300,
    },

    requests: {
      used:
        182430,
      limit:
        1000000,
    },

    daily: [
      {
        date:
          "2026-09-18",

        bandwidthBytes:
          2576980378,

        requests:
          24120,

        buildMinutes:
          8,
      },

      {
        date:
          "2026-09-17",

        bandwidthBytes:
          1932735283,

        requests:
          19402,

        buildMinutes:
          6,
      },

      {
        date:
          "2026-09-16",

        bandwidthBytes:
          1610612736,

        requests:
          17880,

        buildMinutes:
          7,
      },

      {
        date:
          "2026-09-15",

        bandwidthBytes:
          1503238553,

        requests:
          16340,

        buildMinutes:
          5,
      },

      {
        date:
          "2026-09-14",

        bandwidthBytes:
          1825361100,

        requests:
          22821,

        buildMinutes:
          9,
      },

      {
        date:
          "2026-09-13",

        bandwidthBytes:
          1395864371,

        requests:
          20552,

        buildMinutes:
          4,
      },

      {
        date:
          "2026-09-12",

        bandwidthBytes:
          1073741824,

        requests:
          17641,

        buildMinutes:
          3,
      },
    ],
  },
];