import { parsePartners, parseTestimonials } from "@/lib/partners-testimonials";
import { parseTeamMembers } from "@/lib/team-members";
import type { AboutValueItem, ApproachItem, ExpertiseItem } from "@/lib/settings-utils";
import type { HeroBannerRecord } from "@/lib/settings-images";

const TOP_LEVEL_IMAGE_KEYS = new Set([
  "company_logo",
  "favicon",
  "preloader_logo",
  "about_hero_image",
  "intro_image_url",
]);

function pushUrl(urls: string[], value: unknown): void {
  if (typeof value !== "string") return;
  const trimmed = value.trim();
  if (trimmed && /^https?:\/\//i.test(trimmed)) urls.push(trimmed);
}

function collectFromImageRecords(
  urls: string[],
  items: unknown,
  pickImage: (item: Record<string, unknown>) => unknown,
): void {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    pushUrl(urls, pickImage(item as Record<string, unknown>));
  }
}

/** Collects http(s) image URLs stored under a settings key (for orphan cleanup on save). */
export function collectSettingImageUrls(key: string, value: unknown): string[] {
  const urls: string[] = [];

  if (TOP_LEVEL_IMAGE_KEYS.has(key)) {
    pushUrl(urls, value);
    return urls;
  }

  switch (key) {
    case "hero_banners":
      if (!Array.isArray(value)) break;
      for (const item of value) {
        if (typeof item === "string") {
          pushUrl(urls, item);
          continue;
        }
        if (!item || typeof item !== "object") continue;
        const banner = item as HeroBannerRecord;
        pushUrl(urls, banner.image ?? banner.src);
      }
      break;
    case "expertise_items":
      collectFromImageRecords(urls, value, (item) => (item as ExpertiseItem).image);
      break;
    case "approach_items":
      collectFromImageRecords(urls, value, (item) => (item as ApproachItem).image);
      break;
    case "about_value_items":
      collectFromImageRecords(urls, value, (item) => (item as AboutValueItem).image);
      break;
    case "partners":
      for (const p of parsePartners(value)) pushUrl(urls, p.image);
      break;
    case "testimonials":
      for (const t of parseTestimonials(value)) pushUrl(urls, t.image);
      break;
    case "team_members":
      for (const m of parseTeamMembers(value)) pushUrl(urls, m.image);
      break;
    default:
      break;
  }

  return urls;
}
