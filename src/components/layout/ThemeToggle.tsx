"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:bg-bg-card-hover"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-[18px] w-[18px] text-text-secondary transition-colors hover:text-f1-red" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-text-secondary transition-colors hover:text-f1-red" />
      )}
    </button>
  );
}
