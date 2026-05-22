"use client";

import Image from "next/image";
import { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import {
  getMediaCoverageDisplayLogos,
  resolveMediaCoverageSectionCopy,
} from "@/lib/partners-testimonials";
import { cn } from "@/lib/utils";

type MediaLogoItem = {
  id: number;
  name: string;
  image: string;
};

function MediaLogoCard({ logo }: { logo: MediaLogoItem }) {
  const showName = logo.name.trim().length > 0;

  return (
    <div
      className={cn(
        "group relative flex h-20 w-36 shrink-0 items-center justify-center sm:h-24 sm:w-44 md:h-28 md:w-52 lg:h-32 lg:w-56",
        showName && "cursor-default",
      )}
      title={showName ? logo.name : undefined}
    >
      <div className="relative h-full w-full px-4">
        <Image
          src={logo.image}
          alt={showName ? logo.name : "Media outlet logo"}
          fill
          sizes="(max-width: 768px) 144px, 224px"
          className="object-contain object-center"
        />
      </div>
      {showName ? (
        <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 max-w-[12rem] -translate-x-1/2 truncate rounded-md bg-slate-900/90 px-2.5 py-1 text-center text-[10px] font-semibold tracking-wide text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
          {logo.name}
        </span>
      ) : null}
    </div>
  );
}

export function Testimonials({ data }: { data?: Record<string, unknown> }) {
  const { t, locale } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const copy = resolveMediaCoverageSectionCopy(
    data,
    locale,
    String(t("mediaCoverage.header") || "AS COVERED BY"),
  );

  const logos: MediaLogoItem[] = getMediaCoverageDisplayLogos(data, locale);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.65, 280);
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }, []);

  if (!logos.length) return null;

  const showArrows = logos.length > 3;

  return (
    <section
      id="media-coverage"
      className="relative isolate flex w-full snap-start flex-col justify-center bg-zinc-50 py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:20px_20px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl shrink-0 text-center">
          <h2 className="font-sans text-sm font-bold uppercase tracking-[0.35em] text-slate-900 sm:text-base md:tracking-[0.4em]">
            {copy.header}
          </h2>
          {copy.description ? (
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {copy.description}
            </p>
          ) : null}
        </header>

        <div className="relative mt-12 w-full sm:mt-14 lg:mt-16 group/slider">
          {showArrows ? (
            <>
              <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute top-1/2 left-0 z-20 hidden h-16 w-16 -translate-y-1/2 items-center justify-center text-slate-900/25 transition-colors hover:text-slate-900/45 md:flex lg:left-2"
                aria-label="Scroll media logos left"
              >
                <ChevronLeft className="size-14 stroke-[1.25]" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute top-1/2 right-0 z-20 hidden h-16 w-16 -translate-y-1/2 items-center justify-center text-slate-900/25 transition-colors hover:text-slate-900/45 md:flex lg:right-2"
                aria-label="Scroll media logos right"
              >
                <ChevronRight className="size-14 stroke-[1.25]" aria-hidden />
              </button>
            </>
          ) : null}

          <div
            ref={scrollRef}
            className={cn(
              "flex w-full items-center gap-10 overflow-x-auto pb-4 hide-scrollbar scroll-smooth sm:gap-12 md:gap-14 lg:gap-16",
              showArrows ? "px-12 md:px-16 lg:px-20" : "justify-center px-2",
            )}
          >
            {logos.map((logo) => (
              <MediaLogoCard key={logo.id} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
