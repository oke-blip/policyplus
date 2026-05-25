import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import { parseExpertiseItems } from "@/lib/settings-utils";

/** Scalar keys from Global + CTA admin tabs used by `CTAFooterSection`. */
export const CTA_FOOTER_SCALAR_KEYS = [
  "cta_subtitle",
  "cta_title",
  "cta_button_text",
  "cta_button_link",
  "office_address",
  "email_address",
  "phone_number",
  "company_name",
  "expertise_header",
] as const;

export const DEFAULT_EXPERTISE_FOOTER_ITEMS = [
  "Research & Analysis",
  "Stakeholder Engagement",
  "Project Management",
  "Strategy & Training",
] as const;

export const DEFAULT_ABOUT_FOOTER_ITEMS = [
  "Our Story",
  "Team",
  "Careers",
  "Contact",
] as const;

export type SocialLinkRecord = {
  id?: string | number;
  platform?: string;
  url?: string;
};

/** True when settings already include CTA, contact, social, or expertise footer data. */
export function hasCtaFooterSource(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;

  if (
    CTA_FOOTER_SCALAR_KEYS.some((key) => {
      const value = raw[key];
      return typeof value === "string" && value.trim().length > 0;
    })
  ) {
    return true;
  }

  if (parseSocialLinks(raw.social_links).length > 0) return true;
  if (parseExpertiseItems(raw.expertise_items).length > 0) return true;

  return false;
}

export function parseSocialLinks(raw: unknown): SocialLinkRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is SocialLinkRecord => typeof item === "object" && item !== null);
}

export function pickCtaFooterString(
  raw: Record<string, unknown>,
  key: string,
  fallback: string,
  locale: ContentLocale,
): string {
  const en = typeof raw[key] === "string" ? (raw[key] as string) : undefined;
  const id =
    typeof raw[`${key}_id`] === "string" ? (raw[`${key}_id`] as string) : undefined;
  const picked = pickLocalized(locale, en, id);
  return picked.trim() || fallback;
}

export function expertiseFooterLabels(
  raw: Record<string, unknown>,
  locale: ContentLocale,
): string[] {
  const items = parseExpertiseItems(raw.expertise_items);
  return items
    .map((item) => {
      const title = pickLocalized(locale, item.title, item.title_id);
      const tag = pickLocalized(locale, item.tag, item.tag_id);
      return title.trim() || tag.trim();
    })
    .filter((label) => label.length > 0);
}
