"use client";

import * as React from "react";

import en from "@/locales/en.json";
import id from "@/locales/id.json";

type Language = "EN" | "ID";
export type ContentLocale = "en" | "id";
type Dictionary = Record<string, unknown>;

type LanguageContextValue = {
  language: Language;
  locale: ContentLocale;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  toggleLanguage: () => void;
  t: <T = string>(key: string) => T;
};

const dictionaries: Record<Language, Dictionary> = {
  EN: en as Dictionary,
  ID: id as Dictionary,
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>("EN");

  const toggleLanguage = React.useCallback(() => {
    setLanguage((prev) => (prev === "EN" ? "ID" : "EN"));
  }, []);

  const t = React.useCallback(
    <T,>(key: string): T => {
      const dictionary = dictionaries[language];
      const value = key
        .split(".")
        .filter(Boolean)
        .reduce<unknown>((acc, part) => {
          if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
            return (acc as Record<string, unknown>)[part];
          }
          return undefined;
        }, dictionary);

      return (value === undefined ? key : value) as T;
    },
    [language]
  );

  const locale: ContentLocale = language === "ID" ? "id" : "en";

  const value = React.useMemo(
    () => ({ language, locale, setLanguage, toggleLanguage, t }),
    [language, locale, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
