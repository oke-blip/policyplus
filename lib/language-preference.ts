export const LANGUAGE_COOKIE_NAME = "policyplus-lang";
export const LANGUAGE_STORAGE_KEY = LANGUAGE_COOKIE_NAME;

export type ContentLocale = "en" | "id";
export type StoredLanguage = ContentLocale;

export function languageToStored(language: "EN" | "ID"): StoredLanguage {
  return language === "ID" ? "id" : "en";
}

export function storedToLanguage(stored: string | null | undefined): "EN" | "ID" {
  return stored === "id" ? "ID" : "EN";
}

export function parseStoredLanguage(value: string | null | undefined): StoredLanguage | null {
  if (value === "en" || value === "id") return value;
  return null;
}

export function storedToContentLocale(stored: StoredLanguage): ContentLocale {
  return stored;
}
