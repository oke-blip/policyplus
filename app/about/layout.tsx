import type { Metadata } from "next";
import { getServerContentLocale } from "@/lib/get-server-content-locale";
import {
  cmsHttpsUrl,
  DEFAULT_PRELOADER_COMPANY_NAME,
  pickPreloaderString,
} from "@/lib/preloader-settings";
import { getAllSettings } from "@/lib/settings";

const DEFAULT_SITE_TITLE = DEFAULT_PRELOADER_COMPANY_NAME;

export async function generateMetadata(): Promise<Metadata> {
  let settings: Record<string, unknown> = {};

  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  const locale = await getServerContentLocale();
  const siteTitle = pickPreloaderString(
    settings,
    "company_name",
    DEFAULT_SITE_TITLE,
    locale,
  );
  const faviconUrl =
    cmsHttpsUrl(settings.favicon) ?? cmsHttpsUrl(settings.company_logo);

  const metadata: Metadata = {
    title: {
      default: `About Us | ${siteTitle}`,
      template: `%s | ${siteTitle}`,
    },
    description:
      "Learn who we are and our mission: evidence-based policy in Indonesia and trusted advisory for dynamic governance.",
  };

  if (faviconUrl) {
    metadata.icons = { icon: faviconUrl, shortcut: faviconUrl };
  }

  return metadata;
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
