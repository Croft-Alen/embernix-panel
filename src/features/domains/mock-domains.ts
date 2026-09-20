import type {
  WebsiteDomain,
} from "@/features/domains/types";

export const mockDomains: WebsiteDomain[] = [
  {
    id: "domain_01",

    websiteId:
      "site_01",

    hostname:
      "croftstudio.online",

    type:
      "custom",

    primary:
      true,

    status:
      "connected",

    sslStatus:
      "active",

    createdAt:
      "2026-09-15T10:00:00.000Z",

    dnsRecords: [
      {
        id: "dns_01",

        type:
          "CNAME",

        name:
          "@",

        value:
          "edge.embernix.site",

        status:
          "valid",
      },

      {
        id: "dns_02",

        type:
          "CNAME",

        name:
          "www",

        value:
          "edge.embernix.site",

        status:
          "valid",
      },
    ],
  },

  {
    id: "domain_02",

    websiteId:
      "site_01",

    hostname:
      "croft-studio.embernix.site",

    type:
      "embernix",

    primary:
      false,

    status:
      "connected",

    sslStatus:
      "active",

    createdAt:
      "2026-09-15T09:40:00.000Z",
  },

  {
    id: "domain_03",

    websiteId:
      "site_01",

    hostname:
      "preview.croftstudio.online",

    type:
      "custom",

    primary:
      false,

    status:
      "pending",

    sslStatus:
      "pending",

    createdAt:
      "2026-09-18T08:10:00.000Z",

    dnsRecords: [
      {
        id: "dns_03",

        type:
          "CNAME",

        name:
          "preview",

        value:
          "edge.embernix.site",

        status:
          "pending",
      },
    ],
  },
];