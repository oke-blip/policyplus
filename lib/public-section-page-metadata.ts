import type { Metadata } from "next";

import { getServerContentLocale } from "@/lib/get-server-content-locale";
import { cmsHttpsUrl } from "@/lib/preloader-settings";
import { getAllSettings } from "@/lib/settings";

type LocalizedCopy = { en: string; id: string };

export async function buildPublicSectionMetadata(
  pageTitle: LocalizedCopy,
  description: LocalizedCopy,
): Promise<Metadata> {
  let settings: Record<string, unknown> = {};

  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  const locale = await getServerContentLocale();
  const title = locale === "id" ? pageTitle.id : pageTitle.en;
  const desc = locale === "id" ? description.id : description.en;
  const faviconUrl =
    cmsHttpsUrl(settings.favicon) ?? cmsHttpsUrl(settings.company_logo);

  const metadata: Metadata = {
    title,
    description: desc,
  };

  if (faviconUrl) {
    metadata.icons = { icon: faviconUrl, shortcut: faviconUrl };
  }

  return metadata;
}
