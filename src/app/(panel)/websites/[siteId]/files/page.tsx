import {
  FolderOpen,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  FileManager,
} from "@/components/files/file-manager";

import type {
  FileItem,
  FileTree,
} from "@/features/files/types";

import {
  listWebsiteFiles,
} from "@/server/services/file-service";

import {
  getWebsite,
} from "@/server/services/website-service";

type FilesPageProps = {
  params: Promise<{
    siteId: string;
  }>;
};

export default async function FilesPage({
  params,
}: FilesPageProps) {
  const {
    siteId,
  } = await params;

  const website =
    await getWebsite(
      siteId
    );

  if (!website) {
    notFound();
  }

  const records =
    await listWebsiteFiles(
      siteId
    );

  const initialFiles =
    buildFileTree(
      records
    );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-[var(--primary)]" />

          <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-semibold tracking-tight">
            Files
          </h1>
        </div>

        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Browse, edit and manage your website source files.
        </p>
      </div>

      <FileManager
        websiteId={
          website.id
        }
        initialFiles={
          initialFiles
        }
        isInitialSetup={
          website.setup_status !==
          "completed"
        }
      />
    </div>
  );
}

type WebsiteFileRecords =
  Awaited<
    ReturnType<
      typeof listWebsiteFiles
    >
  >;

function buildFileTree(
  records:
    WebsiteFileRecords
): FileTree {
  const tree: FileTree = {
    "/": [],
  };

  const folders =
    new Map<
      string,
      FileItem
    >();

  for (
    const record
    of records
  ) {
    const cleanPath =
      record.path
        .replace(
          /\\/g,
          "/"
        )
        .replace(
          /^\/+/,
          ""
        )
        .replace(
          /\/+/g,
          "/"
        );

    if (!cleanPath) {
      continue;
    }

    const parts =
      cleanPath
        .split("/")
        .filter(
          Boolean
        );

    if (
      parts.length ===
      0
    ) {
      continue;
    }

    let parentPath =
      "/";

    for (
      let index = 0;
      index <
      parts.length - 1;
      index += 1
    ) {
      const folderName =
        parts[index];

      const folderPath =
        parentPath ===
        "/"
          ? `/${folderName}`
          : `${parentPath}/${folderName}`;

      if (
        !tree[
          parentPath
        ]
      ) {
        tree[
          parentPath
        ] = [];
      }

      if (
        !folders.has(
          folderPath
        )
      ) {
        const folder:
          FileItem = {
          id:
            `folder:${folderPath}`,

          name:
            folderName,

          type:
            "folder",

          path:
            folderPath,

          updatedAt:
            record.updated_at,
        };

        folders.set(
          folderPath,
          folder
        );

        tree[
          parentPath
        ].push(
          folder
        );
      }

      if (
        !tree[
          folderPath
        ]
      ) {
        tree[
          folderPath
        ] = [];
      }

      parentPath =
        folderPath;
    }

    const fileName =
      parts[
        parts.length - 1
      ];

    const filePath =
      `/${cleanPath}`;

    if (
      !tree[
        parentPath
      ]
    ) {
      tree[
        parentPath
      ] = [];
    }

    tree[
      parentPath
    ].push({
      id:
        record.id,

      name:
        fileName,

      type:
        "file",

      path:
        filePath,

      size:
        Number(
          record.size_bytes
        ),

      extension:
        getExtension(
          fileName
        ),

      contentType:
        record.content_type ??
        undefined,

      updatedAt:
        record.updated_at,
    });
  }

  for (
    const path
    of Object.keys(
      tree
    )
  ) {
    tree[
      path
    ].sort(
      (
        first,
        second
      ) => {
        if (
          first.type !==
          second.type
        ) {
          return first.type ===
            "folder"
            ? -1
            : 1;
        }

        return first.name.localeCompare(
          second.name
        );
      }
    );
  }

  return tree;
}

function getExtension(
  name: string
) {
  if (
    !name.includes(
      "."
    )
  ) {
    return undefined;
  }

  return name
    .split(".")
    .pop()
    ?.toLowerCase();
}