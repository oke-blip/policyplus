"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  hasAboutIntroSource,
  resolveAboutIntroContent,
} from "@/lib/about-intro-settings";

export type AboutSectionProps = {
  /** Full settings map from `getAllSettings()` (homepage) or partial CMS payload. */
  data?: Record<string, unknown>;
};

export function AboutSection({ data }: AboutSectionProps) {
  const { t, locale } = useLanguage();
  const [fetchedSettings, setFetchedSettings] = useState<Record<string, unknown> | null>(null);

  const source = useMemo(
    () => data ?? fetchedSettings ?? {},
    [data, fetchedSettings],
  );

  const intro = useMemo(
    () =>
      resolveAboutIntroContent(source, locale, {
        eyebrow: String(t("about.eyebrow")),
        title: String(t("about.title")),
        description: String(t("about.description")),
        link: String(t("about.link")),
      }),
    [source, locale, t],
  );

  useEffect(() => {
    if (hasAboutIntroSource(data)) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((settings) => {
        if (hasAboutIntroSource(settings as Record<string, unknown>)) {
          setFetchedSettings(settings as Record<string, unknown>);
        }
      })
      .catch(() => {});
  }, [data]);

  return (
    <section className="flex min-h-svh w-full snap-start flex-col bg-gray-50 dark:bg-neutral-900">
      <div className="mx-auto flex w-full flex-1 flex-col justify-start px-4 pt-24 pb-12 sm:px-6 lg:justify-center lg:px-8 lg:py-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="order-1 flex h-full min-h-0 flex-col justify-center py-2 font-sans">
            <div className="flex min-h-0 w-full flex-col items-start gap-3 text-left">
              <p className="text-xs font-semibold tracking-widest text-yellow-600 uppercase dark:text-yellow-500">
                {intro.subtitle}
              </p>
              <h2 className="max-w-xl text-2xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
                {intro.title}
              </h2>
              <p className="max-w-lg text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-400">
                {intro.description}
              </p>
            </div>
            <div className="mt-6 flex w-full justify-start lg:mt-8">
              <Link
                href={intro.ctaLink}
                className="group inline-flex items-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-600"
              >
                {intro.ctaText}
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </div>

          <div className="order-2 relative h-[220px] w-full overflow-hidden rounded-2xl shadow-lg sm:h-[320px] lg:h-[360px] lg:rounded-3xl">
            <Image
              src={intro.imageUrl}
              alt="Professional collaboration in discussion"
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
