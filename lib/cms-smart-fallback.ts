export type SmartFallbackFieldPair = readonly [enKey: string, idKey: string];

export const SMART_FALLBACK_JOB_FIELD_PAIRS: SmartFallbackFieldPair[] = [
  ["title", "title_id"],
  ["department", "department_id"],
  ["location", "location_id"],
  ["salaryRange", "salaryRange_id"],
  ["description", "description_id"],
  ["requirements", "requirements_id"],
];

export const SMART_FALLBACK_EVENT_FIELD_PAIRS: SmartFallbackFieldPair[] = [
  ["title", "title_id"],
  ["category", "category_id"],
  ["location", "location_id"],
];

export const SMART_FALLBACK_CATEGORY_NAME_PAIRS: SmartFallbackFieldPair[] = [
  ["name", "name_id"],
];

export const SMART_FALLBACK_POST_FIELD_PAIRS: SmartFallbackFieldPair[] = [
  ["title", "title_id"],
  ["content", "content_id"],
  ["category", "category_id"],
  ["author_name", "author_name_id"],
  ["author_role", "author_role_id"],
  ["author_bio", "author_bio_id"],
  ["tags", "tags_id"],
];

export const SMART_FALLBACK_PARTNERS_HEADER_PAIRS: SmartFallbackFieldPair[] = [
  ["partners_header", "partners_header_id"],
  ["testimonials_header", "testimonials_header_id"],
];

export const SMART_FALLBACK_PUBLICATIONS_FIELD_PAIRS: SmartFallbackFieldPair[] = [
  ["knowledge_center_title", "knowledge_center_title_id"],
  ["knowledge_center_subtitle", "knowledge_center_subtitle_id"],
  ["latest_insights_title", "latest_insights_title_id"],
];

export const SMART_FALLBACK_CAREERS_HERO_PAIRS: SmartFallbackFieldPair[] = [
  ["careers_hero_title", "careers_hero_title_id"],
  ["careers_hero_title_accent", "careers_hero_title_accent_id"],
  ["careers_hero_subtitle", "careers_hero_subtitle_id"],
];

export const SMART_FALLBACK_TESTIMONIAL_ITEM_PAIRS: SmartFallbackFieldPair[] = [
  ["quote", "quote_id"],
  ["author", "author_id"],
  ["role", "role_id"],
];

export const SMART_FALLBACK_TEAM_MEMBER_FIELD_PAIRS: SmartFallbackFieldPair[] = [
  ["name", "name_id"],
  ["role", "role_id"],
  ["focus", "focus_id"],
];

export const SMART_FALLBACK_EXPERTISE_ITEM_PAIRS: SmartFallbackFieldPair[] = [
  ["tag", "tag_id"],
  ["title", "title_id"],
  ["desc", "desc_id"],
];

export const SMART_FALLBACK_APPROACH_ITEM_PAIRS: SmartFallbackFieldPair[] = [
  ["phase", "phase_id"],
  ["title", "title_id"],
  ["desc", "desc_id"],
];

export const SMART_FALLBACK_METHODOLOGY_ITEM_PAIRS: SmartFallbackFieldPair[] = [
  ["title", "title_id"],
];

export const SMART_FALLBACK_ABOUT_VALUE_ITEM_PAIRS: SmartFallbackFieldPair[] = [
  ["text", "text_id"],
];

export const SMART_FALLBACK_CTA_FIELD_PAIRS: SmartFallbackFieldPair[] = [
  ["cta_subtitle", "cta_subtitle_id"],
  ["cta_title", "cta_title_id"],
  ["cta_button_text", "cta_button_text_id"],
  ...SMART_FALLBACK_CAREERS_HERO_PAIRS,
];

/** EN header text, or Indonesian when EN is blank (partners / testimonials section titles). */
export function resolveCmsBilingualHeader(en: string, id: string): string {
  const enTrim = en.trim();
  if (enTrim) return enTrim;
  return id.trim();
}

/** Copy `quote_id` / `author_id` / `role_id` into EN fields when EN is empty. */
export function applyPartnersTestimonialsSmartFallback<T extends Record<string, unknown>>(
  items: T[],
): T[] {
  return applySmartFallbackToArrayItems(items, SMART_FALLBACK_TESTIMONIAL_ITEM_PAIRS);
}

export function isEmptyCmsValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function normalizeFallbackValue(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export function hasTruthyCmsValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

/** Pairs [enKey, idKey] for keys ending in `_id` when the base key exists on the object. */
export function detectSmartFallbackFieldPairs(
  payload: Record<string, unknown>,
): SmartFallbackFieldPair[] {
  const pairs: SmartFallbackFieldPair[] = [];
  for (const key of Object.keys(payload)) {
    if (!key.endsWith("_id")) continue;
    const enKey = key.slice(0, -3);
    if (enKey && Object.prototype.hasOwnProperty.call(payload, enKey)) {
      pairs.push([enKey, key]);
    }
  }
  return pairs;
}

/**
 * Copy Indonesian (`*_id`) text into English fields when EN is empty and ID has a value.
 * Mutates and returns the same payload object.
 */
export function applySmartFallback<T extends Record<string, unknown>>(
  payload: T,
  fieldPairs?: SmartFallbackFieldPair[],
): T {
  const pairs = fieldPairs ?? detectSmartFallbackFieldPairs(payload);
  const record = payload as Record<string, unknown>;

  for (const [enKey, idKey] of pairs) {
    if (!Object.prototype.hasOwnProperty.call(record, enKey)) continue;
    const enVal = record[enKey];
    const idVal = record[idKey];
    if (isEmptyCmsValue(enVal) && hasTruthyCmsValue(idVal)) {
      record[enKey] = normalizeFallbackValue(idVal);
    }
  }

  return payload;
}

/** Apply field-pair fallback to each object in an array (e.g. testimonials). */
export function applySmartFallbackToArrayItems<T extends Record<string, unknown>>(
  items: T[],
  fieldPairs: SmartFallbackFieldPair[],
): T[] {
  return items.map((item) => applySmartFallback({ ...item }, fieldPairs));
}
