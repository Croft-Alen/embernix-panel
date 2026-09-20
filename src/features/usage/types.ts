export type UsageMetric = {
  used: number;
  limit: number;
};

export type DailyUsage = {
  date: string;

  bandwidthBytes: number;

  requests: number;

  buildMinutes: number;
};

export type WebsiteUsage = {
  websiteId: string;

  bandwidth: UsageMetric;

  storage: UsageMetric;

  buildMinutes: UsageMetric;

  requests: UsageMetric;

  daily: DailyUsage[];
};