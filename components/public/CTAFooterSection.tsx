"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { SiteFooter } from "@/components/public/site-footer";
import {
  hasCtaFooterSource,
  pickCtaFooterString,
} from "@/lib/cta-footer-settings";

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export function CTAFooterSection({ settings }: { settings?: Record<string, unknown> }) {
  const { locale, t } = useLanguage();
  const [fetchedSettings, setFetchedSettings] = useState<Record<string, unknown> | null>(null);

  const source = useMemo(
    () => settings ?? fetchedSettings ?? {},
    [settings, fetchedSettings],
  );

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

  const ctaSubtitleFallback = String(t("aboutPage.footerEyebrow"));
  const ctaTitleFallback = String(t("aboutPage.footerTitle"));
  const ctaButtonFallback = String(t("aboutPage.footerCta"));

  return (
    <section className="w-full snap-start bg-black">
      <div className="flex min-h-svh w-full flex-col">
        <motion.div
          {...reveal}
          className="flex flex-1 flex-col items-center justify-start px-6 pt-24 pb-8 md:justify-center md:pt-0"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 text-center md:items-start md:text-left">
            <div className="w-full">
              <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">
                {pickCtaFooterString(source, "cta_subtitle", ctaSubtitleFallback, locale)}
              </p>
              <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                {pickCtaFooterString(source, "cta_title", ctaTitleFallback, locale)}
              </h2>
              <Link
                href={pickCtaFooterString(source, "cta_button_link", "#", locale)}
                className="mt-8 block w-full max-w-none"
              >
                <Button className="flex h-auto min-h-[3.5rem] w-full max-w-none justify-center rounded-full bg-yellow-500 px-10 py-4 text-lg font-bold tracking-wide text-black shadow-[0_12px_40px_rgba(234,179,8,0.45)] transition-all duration-300 hover:scale-[1.01] hover:bg-yellow-400 hover:shadow-[0_16px_48px_rgba(234,179,8,0.55)] sm:min-h-[4rem] sm:py-5 sm:text-xl md:min-h-[4.5rem] md:py-6 md:text-2xl">
                  {pickCtaFooterString(source, "cta_button_text", ctaButtonFallback, locale)}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <SiteFooter settings={source} />
      </div>
    </section>
  );
}
