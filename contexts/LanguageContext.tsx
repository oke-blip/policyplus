"use client";

import * as React from "react";

import en from "@/locales/en.json";
import id from "@/locales/id.json";
import {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_STORAGE_KEY,
  languageToStored,
  parseStoredLanguage,
  storedToLanguage,
  type ContentLocale,
} from "@/lib/language-preference";

export type { ContentLocale };

type Language = "EN" | "ID";
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

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const LANGUAGE_CHANGE_EVENT = "policyplus-language-change";

function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;

  try {
    const fromStorage = parseStoredLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
    if (fromStorage) return storedToLanguage(fromStorage);
  } catch {
    // ignore
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LANGUAGE_COOKIE_NAME}=([^;]*)`),
  );
  const fromCookie = parseStoredLanguage(match?.[1] ? decodeURIComponent(match[1]) : null);
  return fromCookie ? storedToLanguage(fromCookie) : null;
}

function getLanguageSnapshot(): Language {
  return readStoredLanguage() ?? "EN";
}

function subscribeLanguage(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();
  window.addEventListener(LANGUAGE_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function persistLanguage(language: Language) {
  const stored = languageToStored(language);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, stored);
  } catch {
    // ignore
  }
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${stored}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = React.useSyncExternalStore<Language>(
    subscribeLanguage,
    getLanguageSnapshot,
    () => "EN",
  );

  const setLanguage = React.useCallback<React.Dispatch<React.SetStateAction<Language>>>(
    (action) => {
      const next = typeof action === "function" ? action(getLanguageSnapshot()) : action;
      persistLanguage(next);
    },
    [],
  );

  const toggleLanguage = React.useCallback(() => {
    setLanguage((prev) => (prev === "EN" ? "ID" : "EN"));
  }, [setLanguage]);

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
    [language],
  );

  const locale: ContentLocale = language === "ID" ? "id" : "en";

  const value = React.useMemo(
    () => ({ language, locale, setLanguage, toggleLanguage, t }),
    [language, locale, setLanguage, toggleLanguage, t],
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
