"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "pgnearme_theme";

let current: Theme | null = null;

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function emit() {
  listeners.forEach((callback) => callback());
}

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
}

function getSnapshot(): Theme {
  if (current === null) {
    if (typeof window === "undefined") return "dark";
    try {
      current = window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      current = "dark";
    }
  }
  return current;
}

function getServerSnapshot(): Theme {
  return "dark";
}

function setTheme(theme: Theme) {
  current = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  applyTheme(theme);
  emit();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === "light" ? "dark" : "light");
  }, []);

  const setThemeMode = useCallback((next: Theme) => {
    setTheme(next);
  }, []);

  return { theme, toggleTheme, setThemeMode };
}