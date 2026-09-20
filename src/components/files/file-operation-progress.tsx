"use client";

import {
  Archive,
  CircleCheck,
  CircleX,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";

import Button from "@/components/ui/Button";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  cancelFileOperationAction,
} from "@/app/(panel)/websites/[siteId]/files/operation-actions";

import type {
  FileOperationRecord,
} from "@/features/file-operations/types";

type FileOperationProgressProps = {
  websiteId:
    string;

  onOperationCompleted?:
    (
      operation:
        FileOperationRecord
    ) =>
      void |
      Promise<void>;
};

export function FileOperationProgress({
  websiteId,
  onOperationCompleted,
}: FileOperationProgressProps) {
  const [
    operations,
    setOperations,
  ] =
    useState<
      FileOperationRecord[]
    >([]);

  const [
    cancelingId,
    setCancelingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const notifiedRef =
    useRef<
      Set<string>
    >(
      new Set()
    );

  const handledInitialRef =
    useRef(
      false
    );

  const handleOperation =
    useCallback(
      async (
        operation:
          FileOperationRecord
      ) => {
        if (
          operation.status !==
          "completed"
        ) {
          return;
        }

        if (
          notifiedRef
            .current
            .has(
              operation.id
            )
        ) {
          return;
        }

        notifiedRef
          .current
          .add(
            operation.id
          );

        await onOperationCompleted?.(
          operation
        );
      },
      [
        onOperationCompleted,
      ]
    );

  useEffect(() => {
    const supabase =
      createClient() as
        SupabaseClient<any>;

    let disposed =
      false;

    async function loadInitial() {
      if (
        handledInitialRef
          .current
      ) {
        return;
      }

      handledInitialRef
        .current =
        true;

      const {
        data,
        error:
          queryError,
      } =
        await supabase
          .from(
            "file_operations"
          )
          .select(
            "*"
          )
          .eq(
            "website_id",
            websiteId
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(
            25
          );

      if (
        disposed
      ) {
        return;
      }

      if (
        queryError
      ) {
        setError(
          `Failed to load file operations: ${queryError.message}`
        );

        return;
      }

      setOperations(
        (
          data ??
          []
        ) as
          FileOperationRecord[]
      );
    }

    const channel =
      supabase
        .channel(
          `file-operations:${websiteId}`
        )
        .on(
          "postgres_changes",
          {
            event:
              "*",

            schema:
              "public",

            table:
              "file_operations",

            filter:
              `website_id=eq.${websiteId}`,
          },
          (
            payload
          ) => {
            if (
              disposed
            ) {
              return;
            }

            const next =
              payload.new;

            if (
              !next ||
              typeof next !==
                "object" ||
              typeof (
                next as {
                  id?: unknown;
                }
              ).id !==
                "string"
            ) {
              return;
            }

            const operation =
              next as
                FileOperationRecord;

            setOperations(
              (
                previous
              ) => {
                const exists =
                  previous.some(
                    (
                      item
                    ) =>
                      item.id ===
                      operation.id
                  );

                if (
                  exists
                ) {
                  return previous.map(
                    (
                      item
                    ) =>
                      item.id ===
                      operation.id
                        ? operation
                        : item
                  );
                }

                return [
                  operation,
                  ...previous,
                ].slice(
                  0,
                  25
                );
              }
            );

            void handleOperation(
              operation
            );
          }
        )
        .subscribe(
          (
            status
          ) => {
            if (
              disposed
            ) {
              return;
            }

            if (
              status ===
              "SUBSCRIBED"
            ) {
              setError(
                null
              );

              void loadInitial();
            }

            if (
              status ===
              "CHANNEL_ERROR"
            ) {
              setError(
                "Realtime connection failed."
              );
            }
          }
        );

    return () => {
      disposed =
        true;

      void supabase
        .removeChannel(
          channel
        );
    };
  }, [
    websiteId,
    handleOperation,
  ]);

  const visible =
    operations.filter(
      (
        operation
      ) =>
        operation.status ===
          "queued" ||
        operation.status ===
          "running" ||
        (
          (
            operation.status ===
              "failed" ||
            operation.status ===
              "canceled" ||
            operation.status ===
              "completed"
          ) &&
          isRecent(
            operation.updated_at
          )
        )
    );

  async function handleCancel(
    operationId:
      string
  ) {
    if (
      cancelingId
    ) {
      return;
    }

    setCancelingId(
      operationId
    );

    setError(
      null
    );

    try {
      await cancelFileOperationAction(
        operationId
      );
    } catch (
      cancelError
    ) {
      setError(
        getErrorMessage(
          cancelError,
          "Failed to cancel operation."
        )
      );
    } finally {
      setCancelingId(
        null
      );
    }
  }

  if (
    visible.length ===
      0 &&
    !error
  ) {
    return null;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-[var(--danger)]/30 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {visible.map(
        (
          operation
        ) => (
          <OperationCard
            key={
              operation.id
            }
            operation={
              operation
            }
            canceling={
              cancelingId ===
              operation.id
            }
            onCancel={() => {
              void handleCancel(
                operation.id
              );
            }}
          />
        )
      )}
    </div>
  );
}

function OperationCard({
  operation,
  canceling,
  onCancel,
}: {
  operation:
    FileOperationRecord;

  canceling:
    boolean;

  onCancel:
    () => void;
}) {
  const active =
    operation.status ===
      "queued" ||
    operation.status ===
      "running";

  const percent =
    operation.status ===
    "completed"
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Number(
              operation
                .progress_percent ??
                0
            )
          )
        );

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <OperationIcon
            operation={
              operation
            }
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">
                {getOperationTitle(
                  operation
                )}
              </p>

              <span className="text-xs text-[var(--muted-foreground)]">
                {getStatusLabel(
                  operation.status
                )}
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
              {operation.progress_message ??
                getDefaultMessage(
                  operation
                )}
            </p>

            {operation.status ===
              "failed" &&
              operation.error_message && (
                <p className="mt-2 text-xs text-[var(--danger)]">
                  {
                    operation.error_message
                  }
                </p>
              )}

            {active && (
              <>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
                  <div
                    className="h-full bg-[var(--primary)]"
                    style={{
                      width:
                        `${percent}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                  <span>
                    {operation.progress_total >
                    0
                      ? `${operation.progress_current.toLocaleString()} / ${operation.progress_total.toLocaleString()}`
                      : operation.status ===
                          "queued"
                        ? "Waiting for worker"
                        : "Working"}
                  </span>

                  <span>
                    {percent}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {active && (
          <Button
            size="sm"
            variant="secondary"
            loading={
              canceling
            }
            icon={
              <X className="h-4 w-4" />
            }
            onClick={
              onCancel
            }
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function OperationIcon({
  operation,
}: {
  operation:
    FileOperationRecord;
}) {
  if (
    operation.status ===
    "completed"
  ) {
    return (
      <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
    );
  }

  if (
    operation.status ===
      "failed" ||
    operation.status ===
      "canceled"
  ) {
    return (
      <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
    );
  }

  if (
    operation.status ===
    "running"
  ) {
    return (
      <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-[var(--primary)]" />
    );
  }

  return (
    <Archive className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
  );
}

function getOperationTitle(
  operation:
    FileOperationRecord
) {
  if (
    operation.kind ===
    "extract_zip"
  ) {
    const archivePath =
      typeof operation
        .payload
        .archivePath ===
      "string"
        ? operation
            .payload
            .archivePath
        : "";

    return archivePath
      ? `Extract ${getBaseName(
          archivePath
        )}`
      : "Extract archive";
  }

  if (
    operation.kind ===
    "create_zip"
  ) {
    const archivePath =
      typeof operation
        .payload
        .archivePath ===
      "string"
        ? operation
            .payload
            .archivePath
        : "";

    return archivePath
      ? `Create ${getBaseName(
          archivePath
        )}`
      : "Create ZIP archive";
  }

  if (
    operation.kind ===
    "move_items"
  ) {
    return "Move files";
  }

  return "Copy files";
}

function getDefaultMessage(
  operation:
    FileOperationRecord
) {
  switch (
    operation.status
  ) {
    case "queued":
      return "Waiting for background worker";

    case "running":
      return "Operation is running";

    case "completed":
      return "Operation completed";

    case "failed":
      return "Operation failed";

    case "canceled":
      return "Operation canceled";
  }
}

function getStatusLabel(
  status:
    FileOperationRecord["status"]
) {
  switch (
    status
  ) {
    case "queued":
      return "Queued";

    case "running":
      return "Running";

    case "completed":
      return "Completed";

    case "failed":
      return "Failed";

    case "canceled":
      return "Canceled";
  }
}

function getBaseName(
  path:
    string
) {
  const parts =
    path
      .replace(
        /\\/g,
        "/"
      )
      .split("/")
      .filter(
        Boolean
      );

  return (
    parts[
      parts.length -
        1
    ] ??
    path
  );
}

function isRecent(
  value:
    string
) {
  const timestamp =
    new Date(
      value
    ).getTime();

  if (
    Number.isNaN(
      timestamp
    )
  ) {
    return false;
  }

  return (
    Date.now() -
      timestamp <
    15_000
  );
}

function getErrorMessage(
  error:
    unknown,
  fallback:
    string
) {
  return error instanceof
    Error
    ? error.message
    : fallback;
}