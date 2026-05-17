import {
  mergeTestimonialIdFields,
  parseTestimonialIdRows,
  parseTestimonials,
  prepareTestimonialIdRowsForSave,
} from "@/lib/partners-testimonials";
import { parseSettingValue } from "@/lib/settings-utils";

import { SETTINGS_STRING_LOCALE_KEYS } from "@/lib/settings-locale-keys";

/** Setting keys that store Indonesian copy as a plain string in `value_id`. */
export const STRING_LOCALE_SETTING_KEYS = [
  "partners_header",
  "testimonials_header",
  ...SETTINGS_STRING_LOCALE_KEYS,
] as const;

export type StringLocaleSettingKey = (typeof STRING_LOCALE_SETTING_KEYS)[number];

export function localeIdFieldKey(key: StringLocaleSettingKey): string {
  return `${key}_id`;
}

export function applySettingLocaleFields(
  acc: Record<string, unknown>,
  key: string,
  enValue: unknown,
  rawValueId: unknown,
): void {
  acc[key] = enValue;

  if (rawValueId == null) return;

  const idValue = parseSettingValue(rawValueId);

  if ((STRING_LOCALE_SETTING_KEYS as readonly string[]).includes(key)) {
    if (typeof idValue === "string" && idValue.trim()) {
      acc[localeIdFieldKey(key as StringLocaleSettingKey)] = idValue.trim();
    }
    return;
  }

  if (key === "testimonials" && Array.isArray(enValue)) {
    const merged = mergeTestimonialIdFields(
      parseTestimonials(enValue),
      parseTestimonialIdRows(idValue),
    );
    acc[key] = merged;
  }
}

/** Split POST body: EN keys → `value`, `*_id` / testimonial ID rows → `value_id`. */
export function splitSettingsSavePayload(data: Record<string, unknown>): {
  en: Record<string, unknown>;
  idByKey: Record<string, unknown>;
} {
  const en: Record<string, unknown> = { ...data };
  const idByKey: Record<string, unknown> = {};

  for (const key of STRING_LOCALE_SETTING_KEYS) {
    const idField = localeIdFieldKey(key);
    if (!(idField in en)) continue;
    const idVal = en[idField];
    delete en[idField];
    if (typeof idVal === "string") {
      idByKey[key] = idVal.trim();
    } else if (idVal != null) {
      idByKey[key] = idVal;
    }
  }

  if ("testimonials_id" in en) {
    const idRows = en.testimonials_id;
    delete en.testimonials_id;
    idByKey.testimonials = prepareTestimonialIdRowsForSave(
      parseTestimonialIdRows(idRows),
    );
  }

  return { en, idByKey };
}
