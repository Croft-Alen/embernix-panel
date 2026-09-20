"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode =
  | "light"
  | "dark"
  | "system";

type ResolvedTheme =
  | "light"
  | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext =
  createContext<ThemeContextValue | null>(
    null
  );

const STORAGE_KEY =
  "embernix-theme";

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !==
    "undefined"
  ) {
    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";
  }

  return "dark";
}

function applyTheme(
  mode: ThemeMode
): ResolvedTheme {
  const resolved =
    mode === "system"
      ? getSystemTheme()
      : mode;

  document.documentElement.dataset.theme =
    resolved;

  return resolved;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    theme,
    setThemeState,
  ] =
    useState<ThemeMode>(
      "system"
    );

  const [
    resolvedTheme,
    setResolvedTheme,
  ] =
    useState<ResolvedTheme>(
      "dark"
    );

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem(
        STORAGE_KEY
      ) as ThemeMode | null;

    const initialTheme =
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
        ? storedTheme
        : "system";

    setThemeState(
      initialTheme
    );

    setResolvedTheme(
      applyTheme(
        initialTheme
      )
    );
  }, []);

  useEffect(() => {
    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    function handleSystemChange() {
      if (
        theme !== "system"
      ) {
        return;
      }

      setResolvedTheme(
        applyTheme(
          "system"
        )
      );
    }

    media.addEventListener(
      "change",
      handleSystemChange
    );

    return () => {
      media.removeEventListener(
        "change",
        handleSystemChange
      );
    };
  }, [theme]);

  function setTheme(
    nextTheme: ThemeMode
  ) {
    setThemeState(
      nextTheme
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      nextTheme
    );

    setResolvedTheme(
      applyTheme(
        nextTheme
      )
    );
  }

  function toggleTheme() {
    setTheme(
      resolvedTheme === "dark"
        ? "light"
        : "dark"
    );
  }

  const value =
    useMemo(
      () => ({
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }),
      [
        theme,
        resolvedTheme,
      ]
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(
      ThemeContext
    );

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  }

  return context;
}