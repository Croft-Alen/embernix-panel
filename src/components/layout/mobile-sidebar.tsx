"use client";

import {
  X,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function MobileSidebar({
  open,
  onClose,
  children,
}: MobileSidebarProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <div className="relative z-10 h-full w-[280px] max-w-[85vw]">
        <div className="absolute right-3 top-3 z-20">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  );
}