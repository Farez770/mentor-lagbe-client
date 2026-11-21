"use client";

// ============================================================
// THEME TOGGLE — the little sun/moon button used in BOTH the
// public navbar and the dashboard shell. It only reads/writes
// the shared ThemeProvider context; HeroUI handles the actual
// .dark class on <html>.
// ============================================================
import { Moon, Sun } from "lucide-react";
import { useThemeToggle } from "@/components/theme/ThemeProvider";

export default function ThemeToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { mounted, isDark, toggleTheme } = useThemeToggle();

  // Keep these attributes IDENTICAL on server and first client render.
  // If we used isDark here immediately, a saved dark preference would
  // hydrate with a different aria-label and React would refuse to patch it.
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
      {/* Before hydration we render a same-size empty box so the
          button never jumps and server/client HTML stays identical. */}
      {!mounted ? (
        <span className="block h-5 w-5" />
      ) : (
        <span className="relative flex h-5 w-5 items-center justify-center">
          {/* Dark now -> show SUN (the next mode). */}
          <Sun
            className={`absolute h-5 w-5 transition-all duration-300 ${
              isDark ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
            }`}
            aria-hidden="true"
          />
          {/* Light now -> show MOON (the next mode). */}
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
