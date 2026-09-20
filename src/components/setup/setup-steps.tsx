import {
  Check,
} from "lucide-react";

import type {
  SetupStep,
} from "@/features/setup/types";

type SetupStepsProps = {
  currentStep: SetupStep;
};

const steps: {
  id: SetupStep;
  label: string;
}[] = [
  {
    id: "source",
    label: "Source",
  },
  {
    id: "upload",
    label: "Connect",
  },
  {
    id: "detect",
    label: "Detect",
  },
  {
    id: "review",
    label: "Review",
  },
  {
    id: "deploy",
    label: "Deploy",
  },
];

export function SetupSteps({
  currentStep,
}: SetupStepsProps) {
  const currentIndex =
    steps.findIndex(
      (
        step
      ) =>
        step.id ===
        currentStep
    );

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[620px] items-center">
        {steps.map(
          (
            step,
            index
          ) => {
            const complete =
              index <
              currentIndex;

            const active =
              index ===
              currentIndex;

            return (
              <div
                key={
                  step.id
                }
                className="flex flex-1 items-center"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "flex",
                      "h-8",
                      "w-8",
                      "shrink-0",
                      "items-center",
                      "justify-center",
                      "rounded-full",
                      "border",
                      "text-xs",
                      "font-semibold",

                      complete ||
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]",
                    ].join(
                      " "
                    )}
                  >
                    {complete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <span
                    className={[
                      "text-sm",
                      "font-medium",

                      active
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]",
                    ].join(
                      " "
                    )}
                  >
                    {
                      step.label
                    }
                  </span>
                </div>

                {index <
                  steps.length -
                    1 && (
                  <div className="mx-4 h-px flex-1 bg-[var(--border)]" />
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}