import { pickLocalized, type ContentLocale } from "@/lib/content-locale";

export const PUBLICATIONS_SECTION_SETTING_KEYS = [
  "knowledge_center_title",
  "knowledge_center_subtitle",
  "latest_insights_title",
] as const;

export type PublicationsSectionSettingKey =
  (typeof PUBLICATIONS_SECTION_SETTING_KEYS)[number];

export type KnowledgeCenterHeaderFallbacks = {
  title: string;
  subtitle: string;
};

function pickString(raw: Record<string, unknown>, key: string): string | undefined {
  const value = raw[key];
  return typeof value === "string" ? value : undefined;
}

function pickPublicationsField(
  raw: Record<string, unknown>,
  key: PublicationsSectionSettingKey,
  locale: ContentLocale,
  fallback: string,
): string {
  const en = pickString(raw, key);
  const id = pickString(raw, `${key}_id`);
  const picked = pickLocalized(locale, en, id);
  return picked.trim() || fallback;
}

export function resolveKnowledgeCenterHeader(
  raw: Record<string, unknown> | undefined,
  locale: ContentLocale,
  fallbacks: KnowledgeCenterHeaderFallbacks,
): KnowledgeCenterHeaderFallbacks {
  const settings = raw ?? {};
  return {
    title: pickPublicationsField(
      settings,
      "knowledge_center_title",
      locale,
      fallbacks.title,
    ),
    subtitle: pickPublicationsField(
      settings,
      "knowledge_center_subtitle",
      locale,
      fallbacks.subtitle,
    ),
  };
}

export function resolveLatestInsightsTitle(
  raw: Record<string, unknown> | undefined,
  locale: ContentLocale,
  fallback: string,
): string {
  return pickPublicationsField(raw ?? {}, "latest_insights_title", locale, fallback);
}
