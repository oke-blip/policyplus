export type ContentLocale = "en" | "id";

/** Pick Indonesian field when locale is `id` and a translation exists; otherwise English. */
export function pickLocalized(
  locale: ContentLocale,
  en: string | null | undefined,
  id?: string | null
): string {
  if (locale === "id" && id?.trim()) return id.trim();
  return en ?? "";
}
