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

export function expertiseFooterLabels(raw: Record<string, unknown>): string[] {
  const items = parseExpertiseItems(raw.expertise_items);
  return items
    .map((item) => item.title.trim() || item.tag.trim())
    .filter((label) => label.length > 0);
}
