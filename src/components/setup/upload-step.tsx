"use client";

import {
  FileArchive,
  GitBranch,
  UploadCloud,
} from "lucide-react";

import type {
  SetupSource,
} from "@/features/setup/types";

type UploadStepProps = {
  source: SetupSource;

  uploadedFileName?: string;

  repositoryUrl?: string;

  onFileChange: (
    fileName: string
  ) => void;

  onRepositoryChange: (
    url: string
  ) => void;
};

export function UploadStep({
  source,
  uploadedFileName,
  repositoryUrl,
  onFileChange,
  onRepositoryChange,
}: UploadStepProps) {
  if (
    source === "github"
  ) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">
            Connect Repository
          </h2>

          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Enter the repository containing the project you want to deploy.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--surface-strong)] text-[var(--muted-foreground)]">
              <GitBranch className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Git Repository
              </p>

              <p className="text-xs text-[var(--muted-foreground)]">
                Repository integration is mocked for now.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="repository-url"
              className="text-sm font-medium"
            >
              Repository URL
            </label>

            <input
              id="repository-url"
              value={
                repositoryUrl ??
                ""
              }
              onChange={(
                event
              ) =>
                onRepositoryChange(
                  event.target.value
                )
              }
              className="panel-input"
              placeholder="https://github.com/user/project"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">
          Upload Project
        </h2>

        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Upload your project archive. Embernix will inspect it automatically.
        </p>
      </div>

      <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center">
        <UploadCloud className="h-8 w-8 text-[var(--primary)]" />

        <p className="mt-4 text-sm font-semibold">
          Select project archive
        </p>

        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          ZIP files are supported in this mock flow.
        </p>

        <input
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(
            event
          ) => {
            const file =
              event.target.files?.[0];

            if (file) {
              onFileChange(
                file.name
              );
            }
          }}
        />
      </label>

      {uploadedFileName && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <FileArchive className="h-5 w-5 text-[var(--primary)]" />

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {
                uploadedFileName
              }
            </p>

            <p className="text-xs text-[var(--muted-foreground)]">
              Ready for detection
            </p>
          </div>
        </div>
      )}
    </div>
  );
}