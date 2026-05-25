import {
  parsePartners,
  parseTestimonials,
  parseUnifiedLogoItems,
  preparePartnersForSave,
  prepareTestimonialsForSave,
  prepareUnifiedLogoItemsForSave,
} from "@/lib/partners-testimonials";
import { withSettingsLocaleIdKeys } from "@/lib/settings-locale-keys";
import { isDataUrl } from "@/lib/supabase-storage";
import type { AboutValueItem, ApproachItem, ExpertiseItem } from "@/lib/settings-utils";

const IMAGE_URL_RE = /^https?:\/\//i;

/** Persist only empty strings or http(s) URLs — never base64 or blob previews. */
export function sanitizeStoredImageUrl(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  if (isDataUrl(trimmed) || trimmed.startsWith("blob:")) return "";
  if (IMAGE_URL_RE.test(trimmed)) return trimmed;
  return "";
}

function sanitizeOptionalImageForSave(
  value: unknown,
  label: string,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isDataUrl(trimmed) || trimmed.startsWith("blob:")) {
    throw new Error(
      `${label} must be uploaded to storage, not embedded as base64.`,
    );
  }
  if (!IMAGE_URL_RE.test(trimmed)) return "";
  return trimmed;
}

export type HeroBannerRecord = {
  src?: string;
  alt?: string;
  image?: string;
};

export function sanitizeHeroBannersForSave(
  value: unknown,
): HeroBannerRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (typeof item === "string") {
        const image = sanitizeOptionalImageForSave(
          item,
          `Hero banner ${index + 1}`,
        );
        if (!image) return null;
        return { image, src: image, alt: `Hero banner ${index + 1}` };
      }
      if (!item || typeof item !== "object") return null;
      const record = item as HeroBannerRecord;
      const raw = record.image ?? record.src ?? "";
      const image = sanitizeOptionalImageForSave(
        raw,
        `Hero banner ${index + 1}`,
      );
      if (!image) return null;
      return {
        image,
        src: image,
        alt: record.alt ? String(record.alt) : `Hero banner ${index + 1}`,
      };
    })
    .filter((b): b is HeroBannerRecord => b !== null);
}

export function sanitizeExpertiseItemsForSave(
  value: unknown,
): ExpertiseItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error("expertise_items must be an array of objects.");
    }
    const record = item as ExpertiseItem;
    const image = sanitizeOptionalImageForSave(
      record.image,
      `Expertise card ${index + 1} image`,
    );
    const tag_id = record.tag_id?.trim();
    const title_id = record.title_id?.trim();
    const desc_id = record.desc_id?.trim();
    return {
      ...record,
      tag: String(record.tag ?? ""),
      ...(tag_id ? { tag_id } : {}),
      title: String(record.title ?? ""),
      ...(title_id ? { title_id } : {}),
      desc: record.desc ? String(record.desc) : undefined,
      ...(desc_id ? { desc_id } : {}),
      image: image ?? "",
    };
  });
}

export function sanitizeApproachItemsForSave(
  value: unknown,
): ApproachItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error("approach_items must be an array of objects.");
    }
    const record = item as ApproachItem;
    const image = sanitizeOptionalImageForSave(
      record.image,
      `Approach card ${index + 1} image`,
    );
    const phase_id = record.phase_id?.trim();
    const title_id = record.title_id?.trim();
    const desc_id = record.desc_id?.trim();
    return {
      ...record,
      phase: record.phase ? String(record.phase) : undefined,
      ...(phase_id ? { phase_id } : {}),
      title: String(record.title ?? ""),
      ...(title_id ? { title_id } : {}),
      desc: String(record.desc ?? ""),
      ...(desc_id ? { desc_id } : {}),
      image: image ?? "",
    };
  });
}

export function sanitizeAboutValueItemsForSave(
  value: unknown,
): AboutValueItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error("about_value_items must be an array of objects.");
    }
    const record = item as AboutValueItem;
    const image = sanitizeOptionalImageForSave(
      record.image,
      `About value card ${index + 1} image`,
    );
    const text_id = record.text_id?.trim();
    return {
      ...record,
      text: String(record.text ?? ""),
      ...(text_id ? { text_id } : {}),
      icon: record.icon ? String(record.icon) : undefined,
      image: image ?? "",
    };
  });
}

const TOP_LEVEL_IMAGE_KEYS = [
  "company_logo",
  "favicon",
  "preloader_logo",
  "about_hero_image",
  "intro_image_url",
] as const;

export function prepareSettingsPayloadForSave(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data };

  for (const key of TOP_LEVEL_IMAGE_KEYS) {
    if (!(key in out)) continue;
    const label = key.replace(/_/g, " ");
    out[key] = sanitizeOptionalImageForSave(out[key], label) ?? "";
  }

  if ("hero_banners" in out) {
    out.hero_banners = sanitizeHeroBannersForSave(out.hero_banners);
  }
  if ("expertise_items" in out) {
    out.expertise_items = sanitizeExpertiseItemsForSave(out.expertise_items);
  }
  if ("approach_items" in out) {
    out.approach_items = sanitizeApproachItemsForSave(out.approach_items);
  }
  if ("about_value_items" in out) {
    out.about_value_items = sanitizeAboutValueItemsForSave(out.about_value_items);
  }
  if ("partners_items" in out) {
    out.partners_items = sanitizePartnersItemsForSave(out.partners_items);
  }
  if ("partners" in out) {
    out.partners = sanitizePartnersForSave(out.partners);
  }
  if ("testimonials" in out) {
    out.testimonials = sanitizeTestimonialsForSave(out.testimonials);
  }

  return out;
}

export function sanitizePartnersItemsForSave(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error("partners_items must be an array.");
  }

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const image = (item as { image?: unknown }).image;
    if (typeof image === "string" && isDataUrl(image)) {
      throw new Error(
        "Partner and media logos must be uploaded to storage, not embedded as base64.",
      );
    }
  }

  return prepareUnifiedLogoItemsForSave(parseUnifiedLogoItems(value));
}

export function sanitizePartnersForSave(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error("partners must be an array.");
  }

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const image = (item as { image?: unknown }).image;
    if (typeof image === "string" && isDataUrl(image)) {
      throw new Error(
        "Partner logos must be uploaded to storage, not embedded as base64.",
      );
    }
  }

  return preparePartnersForSave(parsePartners(value));
}

export function sanitizeTestimonialsForSave(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error("testimonials must be an array.");
  }

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const image = (item as { image?: unknown }).image;
    if (typeof image === "string" && isDataUrl(image)) {
      throw new Error(
        "Testimonial avatars must be uploaded to storage, not embedded as base64.",
      );
    }
  }

  return prepareTestimonialsForSave(parseTestimonials(value));
}

function isPendingImage(value: string | undefined): boolean {
  const trimmed = (value ?? "").trim();
  return (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    (trimmed.length > 0 && !IMAGE_URL_RE.test(trimmed) && !isDataUrl(trimmed))
  );
}

export type SettingsAdminTab =
  | "global"
  | "homepage"
  | "expertise"
  | "approach"
  | "methodology"
  | "about"
  | "cta"
  | "publications";

export const SETTINGS_TAB_LABELS: Record<SettingsAdminTab, string> = {
  global: "Global & branding",
  homepage: "Hero & intro",
  expertise: "Expertise",
  approach: "Approach",
  methodology: "Methodology",
  about: "About",
  cta: "CTA & footer",
  publications: "Publications",
};

/** Keys persisted when saving each admin settings tab. */
export const SETTINGS_TAB_KEYS: Record<SettingsAdminTab, readonly string[]> = {
  global: withSettingsLocaleIdKeys([
    "company_name",
    "company_logo",
    "favicon",
    "preloader_logo",
    "preloader_text",
    "email_address",
    "phone_number",
    "office_address",
    "social_links",
  ]),
  homepage: withSettingsLocaleIdKeys([
    "hero_line1_prefix",
    "hero_line1_accent",
    "hero_line2_prefix",
    "hero_line2_accent",
    "hero_description",
    "hero_cta_text",
    "hero_cta_link",
    "hero_secondary_text",
    "hero_secondary_link",
    "hero_banners",
    "intro_subtitle",
    "intro_title",
    "intro_description",
    "intro_image_url",
  ]),
  expertise: withSettingsLocaleIdKeys([
    "expertise_header",
    "expertise_description",
    "expertise_items",
  ]),
  approach: withSettingsLocaleIdKeys([
    "approach_line1",
    "approach_line2",
    "approach_description",
    "approach_items",
  ]),
  methodology: withSettingsLocaleIdKeys([
    "methodology_tag",
    "methodology_header",
    "methodology_description",
    "methodology_items",
  ]),
  about: withSettingsLocaleIdKeys([
    "about_hero_image",
    "about_hero_subtitle",
    "about_hero_title",
    "about_hero_description",
    "about_hero_cta_text",
    "about_hero_cta_link",
    "about_mission_eyebrow",
    "about_mission_title",
    "about_mission_description",
    "about_values_heading",
    "about_value_items",
  ]),
  cta: withSettingsLocaleIdKeys([
    "cta_subtitle",
    "cta_title",
    "cta_button_text",
    "cta_button_link",
    "careers_hero_title",
    "careers_hero_title_accent",
    "careers_hero_subtitle",
  ]),
  publications: withSettingsLocaleIdKeys([
    "knowledge_center_title",
    "knowledge_center_subtitle",
    "latest_insights_title",
    "latest_insights_subtitle",
  ]),
};

export function pickSettingsForTab(
  tab: SettingsAdminTab,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SETTINGS_TAB_KEYS[tab]) {
    if (key in data) out[key] = data[key];
  }
  return out;
}

export function prepareSettingsPayloadForTab(
  tab: SettingsAdminTab,
  data: Record<string, unknown>,
): Record<string, unknown> {
  return prepareSettingsPayloadForSave(pickSettingsForTab(tab, data));
}

type PendingImageSettings = {
  company_logo?: string;
  favicon?: string;
  preloader_logo?: string;
  about_hero_image?: string;
  intro_image_url?: string;
  hero_banners?: HeroBannerRecord[];
  expertise_items?: ExpertiseItem[];
  approach_items?: ApproachItem[];
  about_value_items?: AboutValueItem[];
};

/** True when any image field is still a local preview or non-URL blob. */
export function hasPendingSettingsImages(data: PendingImageSettings): boolean {
  if (isPendingImage(data.company_logo)) return true;
  if (isPendingImage(data.favicon)) return true;
  if (isPendingImage(data.preloader_logo)) return true;
  if (isPendingImage(data.about_hero_image)) return true;
  if (isPendingImage(data.intro_image_url)) return true;

  for (const banner of data.hero_banners ?? []) {
    const src = banner.image ?? banner.src ?? "";
    if (isPendingImage(src)) return true;
  }
  for (const item of data.expertise_items ?? []) {
    if (isPendingImage(item.image)) return true;
  }
  for (const item of data.approach_items ?? []) {
    if (isPendingImage(item.image)) return true;
  }
  for (const item of data.about_value_items ?? []) {
    if (isPendingImage(item.image)) return true;
  }
  return false;
}

/** Pending image check scoped to a single admin tab. */
export function hasPendingSettingsImagesForTab(
  tab: SettingsAdminTab,
  data: Record<string, unknown>,
): boolean {
  return hasPendingSettingsImages(
    pickSettingsForTab(tab, data) as PendingImageSettings,
  );
}
