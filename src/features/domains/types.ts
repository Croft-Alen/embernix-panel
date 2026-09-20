export type DomainStatus =
  | "connected"
  | "pending"
  | "error";

export type SSLStatus =
  | "active"
  | "pending"
  | "error";

export type DNSRecord = {
  id: string;

  type:
    | "A"
    | "AAAA"
    | "CNAME"
    | "TXT";

  name: string;

  value: string;

  status:
    | "valid"
    | "pending"
    | "invalid";
};

export type WebsiteDomain = {
  id: string;

  websiteId: string;

  hostname: string;

  type:
    | "custom"
    | "embernix";

  primary: boolean;

  status: DomainStatus;

  sslStatus: SSLStatus;

  createdAt: string;

  dnsRecords?: DNSRecord[];
};