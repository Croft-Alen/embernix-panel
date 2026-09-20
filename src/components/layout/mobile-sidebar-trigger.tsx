"use client";

import {
  Menu,
} from "lucide-react";

type MobileSidebarTriggerProps = {
  onClick: () => void;
};

export function MobileSidebarTrigger({
  onClick,
}: MobileSidebarTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open navigation"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] lg:hidden"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}