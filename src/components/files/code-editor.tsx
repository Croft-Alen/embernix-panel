"use client";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import Editor from "@monaco-editor/react";

import {
  useTheme,
} from "@/components/theme/theme-provider";

import Button from "@/components/ui/Button";

import type {
  FileItem,
} from "@/features/files/types";

type CodeEditorProps = {
  file: FileItem;

  value: string;

  saving?: boolean;

  onChange: (
    value: string
  ) => void;

  onSave: () => void;

  onClose: () => void;
};

export function CodeEditor({
  file,
  value,
  saving = false,
  onChange,
  onSave,
  onClose,
}: CodeEditorProps) {
  const {
    resolvedTheme,
  } = useTheme();

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={
              <ArrowLeft className="h-4 w-4" />
            }
            disabled={
              saving
            }
            onClick={
              onClose
            }
          >
            Files
          </Button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {file.name}
            </p>

            <p className="truncate text-xs text-[var(--muted-foreground)]">
              {file.path}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          icon={
            <Save className="h-4 w-4" />
          }
          loading={
            saving
          }
          onClick={
            onSave
          }
        >
          Save
        </Button>
      </div>

      <div className="h-[650px]">
        <Editor
          height="100%"
          theme={
            resolvedTheme ===
            "dark"
              ? "vs-dark"
              : "light"
          }
          language={
            getLanguage(
              file.extension
            )
          }
          value={
            value
          }
          onChange={(
            nextValue
          ) =>
            onChange(
              nextValue ??
              ""
            )
          }
          options={{
            minimap: {
              enabled:
                false,
            },

            fontSize:
              14,

            wordWrap:
              "on",

            automaticLayout:
              true,

            scrollBeyondLastLine:
              false,

            padding: {
              top:
                16,

              bottom:
                16,
            },

            tabSize:
              2,

            readOnly:
              saving,
          }}
        />
      </div>
    </div>
  );
}

function getLanguage(
  extension?: string
) {
  switch (
    extension
  ) {
    case "tsx":
    case "ts":
      return "typescript";

    case "jsx":
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";

    case "json":
      return "json";

    case "css":
      return "css";

    case "scss":
      return "scss";

    case "html":
    case "htm":
      return "html";

    case "md":
      return "markdown";

    case "svg":
    case "xml":
      return "xml";

    case "yml":
    case "yaml":
      return "yaml";

    case "php":
      return "php";

    case "py":
      return "python";

    case "java":
      return "java";

    case "go":
      return "go";

    case "rs":
      return "rust";

    case "sql":
      return "sql";

    default:
      return "plaintext";
  }
}