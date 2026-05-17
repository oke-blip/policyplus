import { CAREERS_HERO_SETTING_KEYS } from "@/lib/careers-hero-settings";
import { PUBLICATIONS_SECTION_SETTING_KEYS } from "@/lib/publications-section-settings";

/** Top-level settings keys with Indonesian copy in `value_id` as `{key}_id`. */
export const SETTINGS_STRING_LOCALE_KEYS = [
  "company_name",
  "preloader_text",
  "email_address",
  "phone_number",
  "office_address",
  "hero_line1_prefix",
  "hero_line1_accent",
  "hero_line2_prefix",
  "hero_line2_accent",
  "hero_description",
  "hero_cta_text",
  "hero_secondary_text",
  "intro_subtitle",
  "intro_title",
  "intro_description",
  "expertise_header",
  "expertise_description",
  "approach_line1",
  "approach_line2",
  "approach_description",
  "methodology_tag",
  "methodology_header",
  "methodology_description",
  "about_hero_subtitle",
  "about_hero_title",
  "about_hero_description",
  "about_hero_cta_text",
  "about_mission_eyebrow",
  "about_mission_title",
  "about_mission_description",
  "about_team_eyebrow",
  "about_team_title",
  "about_team_subtitle",
  "about_values_heading",
  "cta_subtitle",
  "cta_title",
  "cta_button_text",
  ...CAREERS_HERO_SETTING_KEYS,
  ...PUBLICATIONS_SECTION_SETTING_KEYS,
] as const;

export type SettingsStringLocaleKey = (typeof SETTINGS_STRING_LOCALE_KEYS)[number];

const localeKeySet = new Set<string>(SETTINGS_STRING_LOCALE_KEYS);

export function isSettingsStringLocaleKey(key: string): key is SettingsStringLocaleKey {
  return localeKeySet.has(key);
}

export function settingsLocaleIdFieldKey(key: SettingsStringLocaleKey): string {
  return `${key}_id`;
}

/** Append `*_id` for keys that store Indonesian copy in `value_id`. */
export function withSettingsLocaleIdKeys(keys: readonly string[]): string[] {
  const out: string[] = [];
  for (const key of keys) {
    out.push(key);
    if (isSettingsStringLocaleKey(key)) {
      out.push(settingsLocaleIdFieldKey(key));
    }
  }
  return out;
}
