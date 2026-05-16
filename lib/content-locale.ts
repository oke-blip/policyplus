export type ContentLocale = "en" | "id";

/** Pick Indonesian copy when locale is ID and a translation exists; otherwise English. */
export function pickLocalized(
  locale: ContentLocale,
  en: string | null | undefined,
  idValue?: string | null,
): string {
  const primary = (en ?? "").trim();
  if (locale === "id" && idValue?.trim()) return idValue.trim();
  return primary;
}
