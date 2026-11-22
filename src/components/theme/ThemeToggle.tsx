"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeToggle } from "@/components/theme/ThemeProvider";

export default function ThemeToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { mounted, isDark, toggleTheme } = useThemeToggle();

  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 ${
        compact ? "size-9" : "size-10"
      }`}
    >
      {!mounted ? (
        <span className="block h-5 w-5" />
      ) : (
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Sun
            className={`absolute h-5 w-5 transition-all duration-300 ${
              isDark ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
            }`}
            aria-hidden="true"
          />
          <Moon
            className={`absolute h-5 w-5 transition-all duration-300 ${
              isDark ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
            aria-hidden="true"
          />
        </span>
      )}
    </button>
  );
}
