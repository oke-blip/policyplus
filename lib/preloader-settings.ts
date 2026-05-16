export const DEFAULT_PRELOADER_COMPANY_NAME = "Policy+";
export const DEFAULT_PRELOADER_QUOTE =
  "Turning Complex Challenges Into Meaningful Solutions.";

export function cmsHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.startsWith("https://") ? trimmed : null;
}

export function pickPreloaderString(
  source: Record<string, unknown>,
  key: string,
  fallback: string,
  locale: "en" | "id",
): string {
  if (locale === "id") {
    const idValue = source[`${key}_id`];
    if (typeof idValue === "string" && idValue.trim().length > 0) {
      return idValue.trim();
    }
  }
  const value = source[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export type PreloaderContent = {
  companyName: string;
  quoteText: string;
  logoUrl: string | null;
};

export function resolvePreloaderContent(
  source: Record<string, unknown>,
  locale: "en" | "id" = "en",
): PreloaderContent {
  return {
    companyName: pickPreloaderString(
      source,
      "company_name",
      DEFAULT_PRELOADER_COMPANY_NAME,
      locale,
    ),
    quoteText: pickPreloaderString(
      source,
      "preloader_text",
      DEFAULT_PRELOADER_QUOTE,
      locale,
    ),
    logoUrl: cmsHttpsUrl(source.preloader_logo),
  };
}
