"use client";

import {
  Braces,
  Check,
  Code2,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  mockDetectedProjects,
} from "@/features/setup/mock-setup";

import type {
  DetectedFramework,
  DetectedProject,
} from "@/features/setup/types";

type DetectStepProps = {
  detectedProject:
    DetectedProject;

  onProjectChange: (
    project: DetectedProject
  ) => void;

  onReady: () => void;
};

const frameworks: {
  value: DetectedFramework;
  label: string;
  description: string;
}[] = [
  {
    value: "nextjs",
    label: "Next.js",
    description:
      "React framework",
  },
  {
    value: "react",
    label: "React / Vite",
    description:
      "React application",
  },
  {
    value: "astro",
    label: "Astro",
    description:
      "Astro project",
  },
  {
    value: "nuxt",
    label: "Nuxt",
    description:
      "Vue framework",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
    description:
      "Svelte framework",
  },
  {
    value: "vue",
    label: "Vue",
    description:
      "Vue application",
  },
  {
    value: "static",
    label: "Static",
    description:
      "HTML, CSS and JS",
  },
  {
    value: "unknown",
    label: "Custom / Other",
    description:
      "Custom configuration",
  },
];

export function DetectStep({
  detectedProject,
  onProjectChange,
  onReady,
}: DetectStepProps) {
  const [
    detecting,
    setDetecting,
  ] =
    useState(true);

  const [
    autoDetect,
    setAutoDetect,
  ] =
    useState(true);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setDetecting(
            false
          );

          onReady();
        },
        1200
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [onReady]);

  function selectFramework(
    framework:
      DetectedFramework
  ) {
    setAutoDetect(
      false
    );

    const project =
      mockDetectedProjects[
        framework
      ];

    if (project) {
      onProjectChange(
        project
      );
    }
  }

  function enableAutoDetection() {
    setAutoDetect(
      true
    );
  }

  if (detecting) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />

        <h2 className="mt-4 text-lg font-semibold">
          Inspecting your project
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
          Embernix is checking your files so it can recommend the correct framework and build configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-lg font-semibold">
          Framework Detection
        </h2>

        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Let Embernix detect your framework automatically, or choose one manually.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Auto-detect framework
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                Embernix will inspect the project and choose the recommended framework automatically.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={
              autoDetect
            }
            onClick={() => {
              if (
                !autoDetect
              ) {
                enableAutoDetection();
              }
            }}
            className={[
              "relative",
              "inline-flex",
              "h-7",
              "w-12",
              "shrink-0",
              "items-center",
              "rounded-full",
              "border",
              "p-1",
              "transition-none",

              autoDetect
                ? "border-[var(--primary)] bg-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--surface-strong)]",
            ].join(" ")}
          >
            <span
              className={[
                "block",
                "h-5",
                "w-5",
                "rounded-full",
                "bg-white",
                "transition-transform",
                "duration-150",

                autoDetect
                  ? "translate-x-5"
                  : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </div>

        {autoDetect && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-md bg-[var(--surface-strong)] px-4 py-3">
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-[var(--success)]" />

              <div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Detected framework
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">
                  {
                    detectedProject.frameworkLabel
                  }
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--success)]">
              Detected
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--border)]" />

        <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Or choose manually
        </span>

        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold">
            Choose your framework
          </h3>

          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Select a framework manually if you do not want to use automatic detection.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {frameworks.map(
            (
              framework
            ) => {
              const selected =
                !autoDetect &&
                detectedProject.framework ===
                  framework.value;

              return (
                <button
                  key={
                    framework.value
                  }
                  type="button"
                  onClick={() =>
                    selectFramework(
                      framework.value
                    )
                  }
                  className={[
                    "relative",
                    "min-h-[105px]",
                    "rounded-lg",
                    "border",
                    "p-4",
                    "text-left",
                    "transition-none",

                    selected
                      ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_7%,var(--surface))]"
                      : "border-[var(--border)] bg-[var(--surface)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={[
                        "flex",
                        "h-9",
                        "w-9",
                        "items-center",
                        "justify-center",
                        "rounded-md",

                        selected
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--surface-strong)] text-[var(--muted-foreground)]",
                      ].join(" ")}
                    >
                      {framework.value ===
                      "static" ? (
                        <Code2 className="h-4 w-4" />
                      ) : (
                        <Braces className="h-4 w-4" />
                      )}
                    </div>

                    {selected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">
                    {
                      framework.label
                    }
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {
                      framework.description
                    }
                  </p>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}