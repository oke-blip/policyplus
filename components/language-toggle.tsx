"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type LanguageToggleProps = {
  variant?: "desktop" | "fab";
  /** Match transparent navbar over hero */
  overDark?: boolean;
  className?: string;
};

export function LanguageToggle({
  variant = "desktop",
  overDark = false,
  className,
}: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  if (variant === "fab") {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={`Language: ${language === "EN" ? "English" : "Indonesia"}`}
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-full border bg-white text-gray-900 shadow-md transition-colors duration-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
          className
        )}
      >
        <span className="text-xs font-bold tracking-wider">{language}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Switch language, currently ${language === "EN" ? "English" : "Indonesia"}`}
      className={cn(
        "inline-flex min-w-[4.25rem] items-center justify-center rounded-full border px-3 py-2 text-[11px] font-semibold tracking-[0.12em] transition-colors duration-300",
        overDark
          ? "border-white/30 bg-black/20 text-white hover:bg-white/10"
          : "border-gray-200 bg-white/90 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:bg-gray-800",
        className
      )}
    >
      {language}
    </button>
  );
}
