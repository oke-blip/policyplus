"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext"; // Pastikan ini ter-import
import {
  expertiseFooterLabels,
  hasCtaFooterSource,
  parseSocialLinks,
} from "@/lib/cta-footer-settings";

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

// Helper pintar untuk mendukung Bilingual Fallback
function pickBilingualString(obj: Record<string, unknown>, key: string, fallback: string, locale: string): string {
  if (locale === "id") {
    const idValue = obj[`${key}_id`];
    if (typeof idValue === "string" && idValue.trim().length > 0) return idValue;
  }
  const value = obj[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

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

export function CTAFooterSection({ settings }: { settings?: Record<string, unknown> }) {
  const { locale } = useLanguage(); // Ambil bahasa aktif (en/id)
  const [fetchedSettings, setFetchedSettings] = useState<Record<string, unknown> | null>(null);

  const source = useMemo(
    () => settings ?? fetchedSettings ?? {},
    [settings, fetchedSettings],
  );

  const socialLinks = useMemo(() => parseSocialLinks(source.social_links), [source.social_links]);
  
  // Keahlian juga mendukung bilingual jika ada expertise_header_id dan expertise_footer_items_id
  const expertiseLabels = useMemo(() => expertiseFooterLabels(source, locale), [source, locale]);

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
    <section className="w-full snap-start bg-black">
      <div className="flex min-h-svh w-full flex-col">
        {/* Konten CTA Utama */}
        <motion.div
          {...reveal}
          className="flex flex-1 flex-col items-center justify-start px-6 pt-24 pb-8 md:justify-center md:pt-0"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 text-center md:items-start md:text-left">
            <div className="w-full">
              <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">
                {pickBilingualString(source, "cta_subtitle", "Final Call To Action", locale)}
              </p>
              <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                {pickBilingualString(source, "cta_title", "Ready to drive meaningful social impact?", locale)}
              </h2>
              <Link
                href={pickBilingualString(source, "cta_button_link", "#", locale)}
                className="mt-8 block w-full max-w-none"
              >
                <Button className="flex h-auto min-h-[3.5rem] w-full max-w-none justify-center rounded-full bg-yellow-500 px-10 py-4 text-lg font-bold tracking-wide text-black shadow-[0_12px_40px_rgba(234,179,8,0.45)] transition-all duration-300 hover:scale-[1.01] hover:bg-yellow-400 hover:shadow-[0_16px_48px_rgba(234,179,8,0.55)] sm:min-h-[4rem] sm:py-5 sm:text-xl md:min-h-[4.5rem] md:py-6 md:text-2xl">
                  {pickBilingualString(source, "cta_button_text", "Get In Touch", locale)}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer Area */}
        <footer className="mt-auto w-full shrink-0 border-t border-gray-800 px-6 pb-6 pt-8 text-left">
          <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-4 md:gap-10">
            {/* Kolom 1: Alamat */}
            <div>
              <h3 className="text-base font-semibold text-white">Address & Contact</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                {pickBilingualString(source, "office_address", "Eco-S Sahid Sudirman, Jakarta", locale)}
                <br />
                {pickBilingualString(source, "email_address", "hello@policyplus.id", locale)}
                <br />
                {pickBilingualString(source, "phone_number", "+62 21 0000 0000", locale)}
              </p>
            </div>

            {/* Kolom 2: Expertise */}
            <div>
              <h3 className="text-base font-semibold text-white">
                {pickBilingualString(source, "expertise_header", "Our Expertise", locale)}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                {expertiseLabels.length > 0 ? (
                  expertiseLabels.map((label) => <li key={label}>{label}</li>)
                ) : (
                  <>
                    <li>Research & Analysis</li>
                    <li>Stakeholder Engagement</li>
                    <li>Project Management</li>
                    <li>Strategy & Training</li>
                  </>
                )}
              </ul>
            </div>

            {/* Kolom 3: About (Static Links) */}
            <div>
              <h3 className="text-base font-semibold text-white">About Us</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                <li>Team</li>
                <li><Link href="/career" className="hover:text-white transition-colors">Careers</Link></li>
                <li>Contact</li>
              </ul>
            </div>

            {/* Kolom 4: Social Media */}
            <div>
              <h3 className="text-base font-semibold text-white">Follow Us</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                {socialLinks.length > 0
                  ? socialLinks.map((link) => (
                      <li key={String(link.id ?? link.platform ?? link.url)}>
                        <a
                          href={link.url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          {displayPlatformName(link.platform)}
                        </a>
                      </li>
                    ))
                  : (
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

          {/* Copyright */}
          <div className="mx-auto mt-8 max-w-7xl border-t border-gray-800 pt-5 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {pickBilingualString(source, "company_name", "Policy+", locale)} All rights reserved
          </div>
        </footer>
      </div>
    </section>
  );
}