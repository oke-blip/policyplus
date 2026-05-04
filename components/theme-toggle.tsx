"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  /** When navbar is transparent over the hero, use light icon colors */
  variant?: "default" | "overDark";
  className?: string;
};

export function ThemeToggle({ variant = "default", className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  /** Flip appearance; when preference is `system`, infer from `resolvedTheme` so toggling works. */
  const handleToggle = () => {
    const t = theme === "system" ? resolvedTheme : theme;
    setTheme(t === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border transition-colors",
        variant === "overDark"
          ? "border-white/20 bg-black/20 text-white backdrop-blur-sm hover:bg-white/15"
          : "border-gray-200 bg-white/80 text-gray-700 backdrop-blur-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-800",
        className
      )}
    >
      {isDark ? <Sun className="size-[1.15rem]" /> : <Moon className="size-[1.15rem]" />}
    </button>
  );
}
