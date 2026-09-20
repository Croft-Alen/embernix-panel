"use client";

import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-plus-jakarta)] text-base font-semibold">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {description}
            </p>
          )}
        </div>

        <div className="p-5">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}