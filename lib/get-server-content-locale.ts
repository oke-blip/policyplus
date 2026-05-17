import { cookies } from "next/headers";

import {
  LANGUAGE_COOKIE_NAME,
  parseStoredLanguage,
  type ContentLocale,
} from "@/lib/language-preference";

/** Read UI language preference from cookie for server components (metadata, etc.). */
export async function getServerContentLocale(): Promise<ContentLocale> {
  const cookieStore = await cookies();
  return parseStoredLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value) ?? "en";
}
