"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DEFAULT_EXPERTISE_FOOTER_ITEMS,
  expertiseFooterLabels,
  hasCtaFooterSource,
  parseSocialLinks,
  pickCtaFooterString,
} from "@/lib/cta-footer-settings";
import type { ExpertiseItem } from "@/lib/settings-utils";

function displayPlatformName(platform: string | undefined): string {
  if (!platform) return "Link";
  const labels: Record<string, string> = {
    linkedin: "LinkedIn",
    twitter: "Twitter / X",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    tiktok: "TikTok",
    threads: "Threads",
    website: "Website",
  };
  return labels[platform] ?? platform;
}

function localeExpertiseFallback(t: (key: string) => unknown): string[] {
  const items = t("expertise.items");
  if (!Array.isArray(items)) return [...DEFAULT_EXPERTISE_FOOTER_ITEMS];
  return (items as ExpertiseItem[])
    .map((item) => String(item.tag ?? item.title ?? "").trim())
    .filter((label) => label.length > 0);
}

export function SiteFooter({ settings }: { settings?: Record<string, unknown> }) {
  const { locale, t } = useLanguage();
  const [fetchedSettings, setFetchedSettings] = useState<Record<string, unknown> | null>(null);

  const source = useMemo(
    () => settings ?? fetchedSettings ?? {},
    [settings, fetchedSettings],
  );

  const socialLinks = useMemo(() => parseSocialLinks(source.social_links), [source.social_links]);
  const expertiseLabels = useMemo(
    () => expertiseFooterLabels(source, locale),
    [source, locale],
  );
  const expertiseFallback = useMemo(() => localeExpertiseFallback(t), [t]);

  useEffect(() => {
    if (hasCtaFooterSource(settings)) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (hasCtaFooterSource(payload as Record<string, unknown>)) {
          setFetchedSettings(payload as Record<string, unknown>);
        }
      })
      .catch(() => {});
  }, [settings]);

  return (
    <footer className="mt-auto w-full shrink-0 border-t border-gray-800 px-6 pb-6 pt-8 text-left">
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-4 md:gap-10">
        <div>
          <h3 className="text-base font-semibold text-white">Address & Contact</h3>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            {pickCtaFooterString(source, "office_address", "Eco-S Sahid Sudirman, Jakarta", locale)}
            <br />
            {pickCtaFooterString(source, "email_address", "hello@policyplus.id", locale)}
            <br />
            {pickCtaFooterString(source, "phone_number", "+62 21 0000 0000", locale)}
          </p>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">
            {pickCtaFooterString(source, "expertise_header", "Our Expertise", locale)}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            {(expertiseLabels.length > 0 ? expertiseLabels : expertiseFallback).map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">About Us</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/about" className="transition-colors hover:text-white">
                Our Story
              </Link>
            </li>
            <li>Team</li>
            <li>
              <Link href="/career" className="transition-colors hover:text-white">
                Careers
              </Link>
            </li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">Follow Us</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => (
                <li key={String(link.id ?? link.platform ?? link.url)}>
                  <a
                    href={link.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {displayPlatformName(link.platform)}
                  </a>
                </li>
              ))
            ) : (
              <>
                <li>LinkedIn</li>
                <li>Instagram</li>
                <li>YouTube</li>
                <li>X / Twitter</li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-gray-800 pt-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        {pickCtaFooterString(source, "company_name", "Policy+", locale)} All rights reserved
      </div>
    </footer>
  );
}
