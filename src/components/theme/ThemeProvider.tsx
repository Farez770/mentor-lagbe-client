"use client";

// ============================================================
// THEME PROVIDER — one single source of truth for light/dark.
//
// HeroUI's useTheme() already does the hard parts for us:
//   1. reads the saved choice from localStorage ("heroui-theme")
//   2. adds/removes the .dark class on <html>
//   3. sets data-theme="light" | "dark" (HeroUI styles react to it)
//   4. saves the new choice when setTheme() is called
//
// We wrap it in our own context so the Navbar toggle and the
// Dashboard toggle ALWAYS show the same icon — even when Next.js
// keeps an old route mounted in the background (Cache Components).
// ============================================================
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTheme } from "@heroui/react";

type ThemeContextValue = {
  /** True only after hydration — avoids an icon flicker on load. */
  mounted: boolean;
  /** The concrete active theme: "light" or "dark". */
  resolvedTheme: string | undefined;
  /** True when dark mode is currently active. */
  isDark: boolean;
  /** Flip light <-> dark. */
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Hydration-safe "am I in the browser?" flag. useSyncExternalStore gives
// the server snapshot `false` and flips to `true` after hydration — without
// a setState-in-effect (which the new react-hooks lint rule forbids).
const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // "light" = the app's existing look is the default for new visitors.
  // A returning visitor's saved choice is picked up by useTheme itself.
  const { resolvedTheme, setTheme } = useTheme("light");

  // Server HTML and the very first client render must match, so we
  // wait for hydration before showing a theme-specific icon.
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    // Use the RESOLVED theme (not the stored intent) so this works
    // even if the stored value is "system".
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

// Small helper used by both toggle buttons.
export function useThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeToggle must be used inside <ThemeProvider>");
  }
  return context;
}
