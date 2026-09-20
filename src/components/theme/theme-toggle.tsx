"use client";

import {
  Moon,
  Sun,
} from "lucide-react";

import {
  useTheme,
} from "@/components/theme/theme-provider";

export function ThemeToggle() {
  const {
    resolvedTheme,
    toggleTheme,
  } = useTheme();

  const isDark =
    resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)]"
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark
          ? "Light mode"
          : "Dark mode"
      }
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}