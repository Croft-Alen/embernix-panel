import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import type {
  DNSRecord,
} from "@/features/domains/types";

type DNSRecordsProps = {
  records: DNSRecord[];
};

export function DNSRecords({
  records,
}: DNSRecordsProps) {
  if (
    records.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      <div className="grid grid-cols-[90px_120px_minmax(0,1fr)_90px] gap-3 border-b border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        <div>
          Type
        </div>

        <div>
          Name
        </div>

        <div>
          Value
        </div>

        <div>
          Status
        </div>
      </div>

      <div className="divide-y divide-[var(--border)] bg-[var(--surface)]">
        {records.map(
          (
            record
          ) => (
            <div
              key={
                record.id
              }
              className="grid grid-cols-[90px_120px_minmax(0,1fr)_90px] items-center gap-3 px-4 py-3 text-sm"
            >
              <span className="font-medium">
                {
                  record.type
                }
              </span>

              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                {
                  record.name
                }
              </span>

              <span className="truncate font-mono text-xs">
                {
                  record.value
                }
              </span>

              <DNSStatus
                status={
                  record.status
                }
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function DNSStatus({
  status,
}: {
  status:
    DNSRecord["status"];
}) {
  if (
    status === "valid"
  ) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--success)]">
        <CheckCircle2 className="h-3.5 w-3.5" />

        Valid
      </span>
    );
  }

  if (
    status ===
    "invalid"
  ) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--danger)]">
        <XCircle className="h-3.5 w-3.5" />

        Invalid
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--warning)]">
      <Clock3 className="h-3.5 w-3.5" />

      Pending
    </span>
  );
}