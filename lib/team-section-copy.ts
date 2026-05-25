import {
  applySmartFallback,
  type SmartFallbackFieldPair,
} from "@/lib/cms-smart-fallback";
import { pickAboutBilingualField } from "@/lib/about-intro-settings";
import type { ContentLocale } from "@/lib/content-locale";

export const TEAM_SECTION_COPY_KEYS = [
  "about_team_eyebrow",
  "about_team_title",
  "about_team_subtitle",
] as const;

export type TeamSectionCopyKey = (typeof TEAM_SECTION_COPY_KEYS)[number];

export type TeamSectionCopy = Record<TeamSectionCopyKey, string> &
  Record<`${TeamSectionCopyKey}_id`, string>;

export const EMPTY_TEAM_SECTION_COPY: TeamSectionCopy = {
  about_team_eyebrow: "",
  about_team_eyebrow_id: "",
  about_team_title: "",
  about_team_title_id: "",
  about_team_subtitle: "",
  about_team_subtitle_id: "",
};

const SMART_FALLBACK_TEAM_SECTION_PAIRS: SmartFallbackFieldPair[] = [
  ["about_team_eyebrow", "about_team_eyebrow_id"],
  ["about_team_title", "about_team_title_id"],
  ["about_team_subtitle", "about_team_subtitle_id"],
];

function pickString(raw: Record<string, unknown>, key: string): string {
  const value = raw[key];
  return typeof value === "string" ? value : "";
}

/** Read team section header strings from flat settings JSON. */
export function parseTeamSectionCopy(raw: Record<string, unknown>): TeamSectionCopy {
  return {
    about_team_eyebrow: pickString(raw, "about_team_eyebrow"),
    about_team_eyebrow_id: pickString(raw, "about_team_eyebrow_id"),
    about_team_title: pickString(raw, "about_team_title"),
    about_team_title_id: pickString(raw, "about_team_title_id"),
    about_team_subtitle: pickString(raw, "about_team_subtitle"),
    about_team_subtitle_id: pickString(raw, "about_team_subtitle_id"),
  };
}

/** Normalize + smart-fallback EN from ID before POST to `/api/settings`. */
export function prepareTeamSectionCopyForSave(copy: TeamSectionCopy): TeamSectionCopy {
  const trimmed = { ...copy };
  for (const key of Object.keys(trimmed) as (keyof TeamSectionCopy)[]) {
    trimmed[key] = trimmed[key].trim();
  }
  return applySmartFallback(trimmed, SMART_FALLBACK_TEAM_SECTION_PAIRS) as TeamSectionCopy;
}

/** Resolved header line for public About team block. */
export function pickTeamSectionField(
  raw: Record<string, unknown>,
  key: TeamSectionCopyKey,
  locale: ContentLocale,
  fallback: string,
): string {
  return pickAboutBilingualField(raw, key, locale, fallback);
}
