import { pickLocalized, type ContentLocale } from "@/lib/content-locale";

export const CAREERS_HERO_SETTING_KEYS = [
  "careers_hero_title",
  "careers_hero_title_accent",
  "careers_hero_subtitle",
] as const;

export type CareersHeroSettingKey = (typeof CAREERS_HERO_SETTING_KEYS)[number];

export type CareersHeroLocaleFallbacks = {
  title: string;
  titleAccent: string;
  subtitle: string;
};

export type CareersHeroResolved = CareersHeroLocaleFallbacks;

function pickString(raw: Record<string, unknown>, key: string): string | undefined {
  const value = raw[key];
  return typeof value === "string" ? value : undefined;
}

/** CMS string with optional `{key}_id` Indonesian copy; falls back when empty. */
export function pickCareersHeroField(
  raw: Record<string, unknown>,
  key: CareersHeroSettingKey,
  locale: ContentLocale,
  fallback: string,
): string {
  const en = pickString(raw, key);
  const id = pickString(raw, `${key}_id`);
  const picked = pickLocalized(locale, en, id);
  return picked.trim() || fallback;
}

/** True when settings include any careers page hero copy. */
export function hasCareersHeroSource(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;
  return CAREERS_HERO_SETTING_KEYS.some((key) => {
    const en = raw[key];
    const id = raw[`${key}_id`];
    return (
      (typeof en === "string" && en.trim().length > 0) ||
      (typeof id === "string" && id.trim().length > 0)
    );
  });
}

export function resolveCareersHeroContent(
  raw: Record<string, unknown> | undefined,
  locale: ContentLocale,
  fallbacks: CareersHeroLocaleFallbacks,
): CareersHeroResolved {
  const settings = raw ?? {};
  return {
    title: pickCareersHeroField(settings, "careers_hero_title", locale, fallbacks.title),
    titleAccent: pickCareersHeroField(
      settings,
      "careers_hero_title_accent",
      locale,
      fallbacks.titleAccent,
    ),
    subtitle: pickCareersHeroField(
      settings,
      "careers_hero_subtitle",
      locale,
      fallbacks.subtitle,
    ),
  };
}
