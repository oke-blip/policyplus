import { pickLocalized, type ContentLocale } from "@/lib/content-locale";

export type ListingPageHeroCopy = {
  eyebrow: string;
  title: string;
  description: string;
};

export type ListingPageSection = "insights" | "knowledge" | "expertise" | "events";

const PAGE_HERO_KEYS: Record<
  ListingPageSection,
  { eyebrow: string; title: string; description: string }
> = {
  insights: {
    eyebrow: "insights_page_eyebrow",
    title: "insights_page_title",
    description: "insights_page_description",
  },
  knowledge: {
    eyebrow: "knowledge_page_eyebrow",
    title: "knowledge_page_title",
    description: "knowledge_page_description",
  },
  expertise: {
    eyebrow: "expertise_page_eyebrow",
    title: "expertise_page_title",
    description: "expertise_page_description",
  },
  events: {
    eyebrow: "events_page_eyebrow",
    title: "events_page_title",
    description: "events_page_description",
  },
};

function pickString(raw: Record<string, unknown>, key: string): string | undefined {
  const value = raw[key];
  return typeof value === "string" ? value : undefined;
}

function pickHeroField(
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

/** Optional CMS keys: `{section}_page_{eyebrow|title|description}` (+ `_id`). */
export function resolveListingPageHero(
  section: ListingPageSection,
  raw: Record<string, unknown> | undefined,
  locale: ContentLocale,
  fallbacks: ListingPageHeroCopy,
): ListingPageHeroCopy {
  const settings = raw ?? {};
  const keys = PAGE_HERO_KEYS[section];
  return {
    eyebrow: pickHeroField(settings, keys.eyebrow, locale, fallbacks.eyebrow),
    title: pickHeroField(settings, keys.title, locale, fallbacks.title),
    description: pickHeroField(settings, keys.description, locale, fallbacks.description),
  };
}
