import {
  Laptop,
  Monitor,
  Smartphone,
} from "lucide-react";

import type {
  AccountSession,
} from "@/features/account/types";

type SessionHistoryProps = {
  sessions:
    AccountSession[];
};

export function SessionHistory({
  sessions,
}: SessionHistoryProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-sm font-semibold">
          Session History
        </h2>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Devices that have recently accessed your account.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            <div>
              Device
            </div>

            <div>
              Browser
            </div>

            <div>
              IP Address
            </div>

            <div>
              Logged In
            </div>
          </div>

          {sessions.map(
            (
              session
            ) => (
              <div
                key={
                  session.id
                }
                className="grid grid-cols-[1fr_1.2fr_1fr_1fr] items-center gap-4 border-b border-[var(--border)] px-5 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <DeviceIcon
                    os={
                      session.os
                    }
                  />

                  <span className="text-sm font-medium">
                    {session.os}
                  </span>

                  {session.current && (
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[var(--success)]">
                      Current
                    </span>
                  )}
                </div>

                <span className="text-sm text-[var(--muted-foreground)]">
                  {
                    session.browser
                  }
                </span>

                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  {
                    session.ipAddress
                  }
                </span>

                <span className="text-sm text-[var(--muted-foreground)]">
                  {formatDate(
                    session.loggedInAt
                  )}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function DeviceIcon({
  os,
}: {
  os: string;
}) {
  const normalized =
    os.toLowerCase();

  if (
    normalized.includes(
      "android"
    ) ||
    normalized.includes(
      "ios"
    )
  ) {
    return (
      <Smartphone className="h-4 w-4 text-[var(--muted-foreground)]" />
    );
  }

  if (
    normalized.includes(
      "mac"
    )
  ) {
    return (
      <Laptop className="h-4 w-4 text-[var(--muted-foreground)]" />
    );
  }

  return (
    <Monitor className="h-4 w-4 text-[var(--muted-foreground)]" />
  );
}

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    }
  ).format(
    new Date(value)
  );
}