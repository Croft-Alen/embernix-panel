import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";

import type {
  BuildStage,
} from "@/features/builds/types";

type BuildProgressProps = {
  stages: BuildStage[];
};

export function BuildProgress({
  stages,
}: BuildProgressProps) {
  return (
    <div className="space-y-1">
      {stages.map(
        (
          stage,
          index
        ) => (
          <div
            key={
              stage.id
            }
            className="relative flex gap-3"
          >
            <div className="relative flex w-5 shrink-0 justify-center">
              <StageIcon
                status={
                  stage.status
                }
              />

              {index <
                stages.length -
                  1 && (
                <div className="absolute top-5 h-[calc(100%+4px)] w-px bg-[var(--border)]" />
              )}
            </div>

            <div className="pb-5">
              <p className="text-sm font-medium">
                {stage.label}
              </p>

              <p className="mt-0.5 text-xs capitalize text-[var(--muted-foreground)]">
                {stage.status}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function StageIcon({
  status,
}: {
  status: BuildStage["status"];
}) {
  if (
    status === "success"
  ) {
    return (
      <CheckCircle2 className="relative z-10 h-5 w-5 bg-[var(--surface)] text-[var(--success)]" />
    );
  }

  if (
    status === "failed"
  ) {
    return (
      <XCircle className="relative z-10 h-5 w-5 bg-[var(--surface)] text-[var(--danger)]" />
    );
  }

  if (
    status === "running"
  ) {
    return (
      <Loader2 className="relative z-10 h-5 w-5 animate-spin bg-[var(--surface)] text-[var(--primary)]" />
    );
  }

  return (
    <Circle className="relative z-10 h-5 w-5 bg-[var(--surface)] text-[var(--border-strong)]" />
  );
}