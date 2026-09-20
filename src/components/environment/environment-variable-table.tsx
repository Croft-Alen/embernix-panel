"use client";

import {
  Plus,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  AddEnvironmentVariableModal,
} from "@/components/environment/add-environment-variable-modal";

import {
  DeleteEnvironmentVariableModal,
} from "@/components/environment/delete-environment-variable-modal";

import {
  EditEnvironmentVariableModal,
} from "@/components/environment/edit-environment-variable-modal";

import {
  EnvironmentVariableRow,
} from "@/components/environment/environment-variable-row";

import type {
  EnvironmentTarget,
  EnvironmentVariable,
} from "@/features/environment/types";

type EnvironmentFilter =
  | "all"
  | "production"
  | "preview";

type EnvironmentVariableTableProps = {
  initialVariables:
    EnvironmentVariable[];

  websiteId: string;
};

export function EnvironmentVariableTable({
  initialVariables,
  websiteId,
}: EnvironmentVariableTableProps) {
  const [
    variables,
    setVariables,
  ] =
    useState<
      EnvironmentVariable[]
    >(
      initialVariables
    );

  const [
    filter,
    setFilter,
  ] =
    useState<EnvironmentFilter>(
      "all"
    );

  const [
    addOpen,
    setAddOpen,
  ] =
    useState(false);

  const [
    editVariable,
    setEditVariable,
  ] =
    useState<EnvironmentVariable | null>(
      null
    );

  const [
    deleteVariable,
    setDeleteVariable,
  ] =
    useState<EnvironmentVariable | null>(
      null
    );

  const filteredVariables =
    useMemo(
      () => {
        if (
          filter ===
          "all"
        ) {
          return variables;
        }

        return variables.filter(
          (
            variable
          ) =>
            variable.target ===
              filter ||
            variable.target ===
              "both"
        );
      },
      [
        variables,
        filter,
      ]
    );

  function handleAdd(
    key: string,
    value: string,
    target: EnvironmentTarget
  ) {
    const exists =
      variables.some(
        (
          variable
        ) =>
          variable.key.toLowerCase() ===
            key.toLowerCase() &&
          variable.target ===
            target
      );

    if (exists) {
      return;
    }

    const now =
      new Date().toISOString();

    const variable:
      EnvironmentVariable =
      {
        id:
          `env-${crypto.randomUUID()}`,

        websiteId,

        key,

        value,

        target,

        createdAt:
          now,

        updatedAt:
          now,
      };

    setVariables(
      (
        previous
      ) => [
        ...previous,
        variable,
      ]
    );

    setAddOpen(
      false
    );
  }

  function handleSave(
    variable:
      EnvironmentVariable,

    key: string,

    value: string,

    target:
      EnvironmentTarget
  ) {
    setVariables(
      (
        previous
      ) =>
        previous.map(
          (
            item
          ) =>
            item.id ===
            variable.id
              ? {
                  ...item,

                  key,

                  value,

                  target,

                  updatedAt:
                    new Date().toISOString(),
                }
              : item
        )
    );

    setEditVariable(
      null
    );
  }

  function handleDelete(
    variable:
      EnvironmentVariable
  ) {
    setVariables(
      (
        previous
      ) =>
        previous.filter(
          (
            item
          ) =>
            item.id !==
            variable.id
        )
    );

    setDeleteVariable(
      null
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={
                filter ===
                "all"
              }
              onClick={() =>
                setFilter(
                  "all"
                )
              }
            >
              All
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "production"
              }
              onClick={() =>
                setFilter(
                  "production"
                )
              }
            >
              Production
            </FilterButton>

            <FilterButton
              active={
                filter ===
                "preview"
              }
              onClick={() =>
                setFilter(
                  "preview"
                )
              }
            >
              Preview
            </FilterButton>
          </div>

          <Button
            icon={
              <Plus className="h-4 w-4" />
            }
            onClick={() =>
              setAddOpen(
                true
              )
            }
          >
            Add Variable
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[minmax(180px,1.1fr)_minmax(220px,1.5fr)_150px_90px] gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              <div>
                Key
              </div>

              <div>
                Value
              </div>

              <div>
                Environment
              </div>

              <div />
            </div>

            {filteredVariables.length >
            0 ? (
              filteredVariables.map(
                (
                  variable
                ) => (
                  <EnvironmentVariableRow
                    key={
                      variable.id
                    }
                    variable={
                      variable
                    }
                    onEdit={
                      setEditVariable
                    }
                    onDelete={
                      setDeleteVariable
                    }
                  />
                )
              )
            ) : (
              <div className="px-6 py-14 text-center">
                <h2 className="text-sm font-semibold">
                  No environment variables
                </h2>

                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  No variables match the selected environment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddEnvironmentVariableModal
        open={
          addOpen
        }
        onClose={() =>
          setAddOpen(
            false
          )
        }
        onAdd={
          handleAdd
        }
      />

      <EditEnvironmentVariableModal
        open={
          editVariable !==
          null
        }
        variable={
          editVariable
        }
        onClose={() =>
          setEditVariable(
            null
          )
        }
        onSave={
          handleSave
        }
      />

      <DeleteEnvironmentVariableModal
        open={
          deleteVariable !==
          null
        }
        variable={
          deleteVariable
        }
        onClose={() =>
          setDeleteVariable(
            null
          )
        }
        onConfirm={
          handleDelete
        }
      />
    </>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;

  children:
    React.ReactNode;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "h-9",
        "rounded-md",
        "border",
        "px-3",
        "text-sm",
        "font-medium",
        "transition-none",

        active
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}