import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import {
  isSettingsStringLocaleKey,
  settingsLocaleIdFieldKey,
} from "@/lib/settings-locale-keys";
import { parseAboutValueItems } from "@/lib/settings-utils";

export const DEFAULT_ABOUT_INTRO_IMAGE =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1500";

export const DEFAULT_ABOUT_CTA_LINK = "/about";

export type AboutPageSettings = {
  about_hero_image?: string;
  about_hero_subtitle?: string;
  about_hero_title?: string;
  about_hero_description?: string;
  about_hero_cta_text?: string;
  about_hero_cta_link?: string;
  about_mission_eyebrow?: string;
  about_mission_title?: string;
  about_mission_description?: string;
  about_team_eyebrow?: string;
  about_team_title?: string;
  about_team_subtitle?: string;
  about_values_heading?: string;
  about_value_items?: ReturnType<typeof parseAboutValueItems>;
};

export type AboutIntroLocaleFallbacks = {
  eyebrow: string;
  title: string;
  description: string;
  link: string;
};

export type AboutIntroResolved = {
  subtitle: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
};

const INTRO_KEYS = [
  "intro_subtitle",
  "intro_title",
  "intro_description",
  "intro_image_url",
] as const;

const HERO_KEYS = [
  "about_hero_image",
  "about_hero_subtitle",
  "about_hero_title",
  "about_hero_description",
  "about_hero_cta_text",
  "about_hero_cta_link",
] as const;

function pickString(raw: Record<string, unknown>, key: string): string | undefined {
  const value = raw[key];
  return typeof value === "string" ? value : undefined;
}

/** CMS string with optional `{key}_id` Indonesian copy; falls back to locale JSON when empty. */
export function pickAboutBilingualField(
  raw: Record<string, unknown>,
  key: string,
  locale: ContentLocale,
  fallback: string,
): string {
  const en = pickString(raw, key);
  const id = pickString(raw, `${key}_id`);
  const picked = pickLocalized(locale, en, id);
  return picked.trim() || fallback;
}

const ABOUT_PAGE_SCALAR_KEYS = [
  ...HERO_KEYS,
  "about_mission_eyebrow",
  "about_mission_title",
  "about_mission_description",
  "about_team_eyebrow",
  "about_team_title",
  "about_team_subtitle",
  "about_values_heading",
] as const;

/** True when settings include About page hero, mission, or value cards. */
export function hasAboutPageSource(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;
  if (
    ABOUT_PAGE_SCALAR_KEYS.some((key) => {
      const value = raw[key];
      return typeof value === "string" && value.trim().length > 0;
    })
  ) {
    return true;
  }
  return parseAboutValueItems(raw.about_value_items).length > 0;
}

function firstTrimmed(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function hasNonEmptySettingString(raw: Record<string, unknown>, key: string): boolean {
  const value = raw[key];
  return typeof value === "string" && value.trim().length > 0;
}

function hasIntroOrHeroSetting(raw: Record<string, unknown>, key: string): boolean {
  if (hasNonEmptySettingString(raw, key)) return true;
  if (isSettingsStringLocaleKey(key)) {
    return hasNonEmptySettingString(raw, settingsLocaleIdFieldKey(key));
  }
  return false;
}

/** Prefer `intro_*` bilingual copy; fall back to `about_hero_*` when intro is empty. */
function pickIntroOrHeroField(
  raw: Record<string, unknown>,
  introKey: string,
  heroKey: string,
  locale: ContentLocale,
  fallback: string,
): string {
  const intro = pickAboutBilingualField(raw, introKey, locale, "");
  const hero = pickAboutBilingualField(raw, heroKey, locale, "");
  return firstTrimmed(intro, hero) || fallback;
}

/** Extract About page hero/mission fields from raw settings (shared with full About page). */
export function pickAboutSettings(raw: Record<string, unknown>): AboutPageSettings {
  const valueItems = parseAboutValueItems(raw.about_value_items);
  return {
    about_hero_image: pickString(raw, "about_hero_image"),
    about_hero_subtitle: pickString(raw, "about_hero_subtitle"),
    about_hero_title: pickString(raw, "about_hero_title"),
    about_hero_description: pickString(raw, "about_hero_description"),
    about_hero_cta_text: pickString(raw, "about_hero_cta_text"),
    about_hero_cta_link: pickString(raw, "about_hero_cta_link"),
    about_mission_eyebrow: pickString(raw, "about_mission_eyebrow"),
    about_mission_title: pickString(raw, "about_mission_title"),
    about_mission_description: pickString(raw, "about_mission_description"),
    about_team_eyebrow: pickString(raw, "about_team_eyebrow"),
    about_team_title: pickString(raw, "about_team_title"),
    about_team_subtitle: pickString(raw, "about_team_subtitle"),
    about_values_heading: pickString(raw, "about_values_heading"),
    ...(valueItems.length > 0 ? { about_value_items: valueItems } : {}),
  };
}

/** True when raw settings include any homepage intro or About hero copy/image. */
export function hasAboutIntroSource(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;
  return [...INTRO_KEYS, ...HERO_KEYS].some((key) => hasIntroOrHeroSetting(raw, key));
}

/**
 * Resolve homepage About intro copy/image/CTA.
 * Uses `intro_*` when set; falls back to `about_hero_*` (CMS About tab often fills those only).
 */
export function resolveAboutIntroContent(
  raw: Record<string, unknown> | undefined,
  locale: ContentLocale,
  fallbacks: AboutIntroLocaleFallbacks,
): AboutIntroResolved {
  const settings = raw ?? {};
  const hero = pickAboutSettings(settings);

  return {
    subtitle: pickIntroOrHeroField(
      settings,
      "intro_subtitle",
      "about_hero_subtitle",
      locale,
      fallbacks.eyebrow,
    ),
    title: pickIntroOrHeroField(settings, "intro_title", "about_hero_title", locale, fallbacks.title),
    description: pickIntroOrHeroField(
      settings,
      "intro_description",
      "about_hero_description",
      locale,
      fallbacks.description,
    ),
    imageUrl:
      firstTrimmed(pickString(settings, "intro_image_url"), hero.about_hero_image) ??
      DEFAULT_ABOUT_INTRO_IMAGE,
    ctaText: pickAboutBilingualField(settings, "about_hero_cta_text", locale, fallbacks.link),
    ctaLink: firstTrimmed(hero.about_hero_cta_link) ?? DEFAULT_ABOUT_CTA_LINK,
  };
}
