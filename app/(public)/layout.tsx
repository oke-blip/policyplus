import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
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
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
  };

  if (faviconUrl) {
    metadata.icons = { icon: faviconUrl, shortcut: faviconUrl };
  }

  return metadata;
}

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let initialSettings: Record<string, unknown> | undefined;

  try {
    initialSettings = await getAllSettings();
  } catch {
    initialSettings = undefined;
  }

  return (
    <>
      <Navbar initialSettings={initialSettings} />
      {children}
    </>
  );
}
