"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTheme } from "@heroui/react";

type ThemeContextValue = {
  mounted: boolean;
  resolvedTheme: string | undefined;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme("light");

  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{ mounted, resolvedTheme, isDark, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeToggle must be used inside <ThemeProvider>");
  }
  return context;
}
