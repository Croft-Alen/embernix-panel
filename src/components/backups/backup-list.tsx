"use client";

import {
  Plus,
} from "lucide-react";

import {
  useState,
} from "react";

import Button from "@/components/ui/Button";

import {
  BackupCard,
} from "@/components/backups/backup-card";

import {
  CreateBackupModal,
} from "@/components/backups/create-backup-modal";

import {
  DeleteBackupModal,
} from "@/components/backups/delete-backup-modal";

import {
  RestoreBackupModal,
} from "@/components/backups/restore-backup-modal";

import type {
  Backup,
} from "@/features/backups/types";

type BackupListProps = {
  initialBackups:
    Backup[];

  websiteId: string;
};

export function BackupList({
  initialBackups,
  websiteId,
}: BackupListProps) {
  const [
    backups,
    setBackups,
  ] =
    useState<Backup[]>(
      initialBackups
    );

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    restoreBackup,
    setRestoreBackup,
  ] =
    useState<Backup | null>(
      null
    );

  const [
    deleteBackup,
    setDeleteBackup,
  ] =
    useState<Backup | null>(
      null
    );

  function handleCreate(
    name?: string
  ) {
    const nextNumber =
      Math.max(
        0,
        ...backups.map(
          (
            backup
          ) =>
            backup.number
        )
      ) + 1;

    const now =
      new Date();

    const backupId =
      `backup-${crypto.randomUUID()}`;

    const newBackup:
      Backup =
      {
        id:
          backupId,

        websiteId,

        number:
          nextNumber,

        name,

        status:
          "creating",

        type:
          "manual",

        createdAt:
          now.toISOString(),
      };

    setBackups(
      (
        previous
      ) => [
        newBackup,
        ...previous,
      ]
    );

    setCreateOpen(
      false
    );

    window.setTimeout(
      () => {
        setBackups(
          (
            previous
          ) =>
            previous.map(
              (
                backup
              ) =>
                backup.id ===
                backupId
                  ? {
                      ...backup,

                      status:
                        "completed",

                      sizeBytes:
                        196083712,

                      completedAt:
                        new Date().toISOString(),
                    }
                  : backup
            )
        );
      },
      1800
    );
  }

  function handleRestore(
    backup: Backup
  ) {
    setRestoreBackup(
      null
    );

    console.log(
      "Restore backup:",
      backup.id
    );
  }

  function handleDelete(
    backup: Backup
  ) {
    setBackups(
      (
        previous
      ) =>
        previous.filter(
          (
            item
          ) =>
            item.id !==
            backup.id
        )
    );

    setDeleteBackup(
      null
    );
  }

  function handleDownload(
    backup: Backup
  ) {
    const content =
      JSON.stringify(
        {
          backup:
            backup.id,

          websiteId:
            backup.websiteId,

          createdAt:
            backup.createdAt,
        },
        null,
        2
      );

    const blob =
      new Blob(
        [
          content,
        ],
        {
          type:
            "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href =
      url;

    anchor.download =
      `backup-${backup.number}.json`;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(
      url
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            icon={
              <Plus className="h-4 w-4" />
            }
            onClick={() =>
              setCreateOpen(
                true
              )
            }
          >
            Create Backup
          </Button>
        </div>

        {backups.length >
        0 ? (
          <div className="space-y-3">
            {backups.map(
              (
                backup
              ) => (
                <BackupCard
                  key={
                    backup.id
                  }
                  backup={
                    backup
                  }
                  onRestore={
                    setRestoreBackup
                  }
                  onDelete={
                    setDeleteBackup
                  }
                  onDownload={
                    handleDownload
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
            <h2 className="text-sm font-semibold">
              No backups yet
            </h2>

            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Create a backup to save a snapshot of your website.
            </p>
          </div>
        )}
      </div>

      <CreateBackupModal
        open={
          createOpen
        }
        onClose={() =>
          setCreateOpen(
            false
          )
        }
        onCreate={
          handleCreate
        }
      />

      <RestoreBackupModal
        open={
          restoreBackup !==
          null
        }
        backup={
          restoreBackup
        }
        onClose={() =>
          setRestoreBackup(
            null
          )
        }
        onConfirm={
          handleRestore
        }
      />

      <DeleteBackupModal
        open={
          deleteBackup !==
          null
        }
        backup={
          deleteBackup
        }
        onClose={() =>
          setDeleteBackup(
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