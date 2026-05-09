"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { asArray } from "@/lib/utils";
import {
  SECTION_HEADER,
  SECTION_SCROLL_BODY,
  SECTION_SCROLL_STYLE,
  SNAP_SECTION,
} from "@/lib/section-shell";

type EventItem = {
  title: string;
  date: string;
  location: string;
  image: string;
};

const HIDDEN_SCROLLBAR_STYLE: CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export function UpcomingEvents() {
  const { t } = useLanguage();
  const items = asArray<EventItem>(t("events.items"));

  return (
    <section className={`${SNAP_SECTION} isolate`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[25] bg-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[55vh] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.06] blur-[110px]"
      />

      <header className={`${SECTION_HEADER} text-center lg:text-center text-white`}>
        <h2 className="text-3xl font-bold text-white lg:text-5xl">{t("events.header")}</h2>
      </header>

      <div
        className={SECTION_SCROLL_BODY}
        style={{ ...SECTION_SCROLL_STYLE, ...HIDDEN_SCROLLBAR_STYLE }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col px-4">
          <div
            className="mx-auto mt-6 flex w-full max-w-7xl flex-row gap-4 overflow-x-auto overscroll-x-contain pb-6 [-webkit-overflow-scrolling:touch] hide-scrollbar snap-x snap-mandatory touch-pan-x lg:mt-8 lg:gap-6"
            style={HIDDEN_SCROLLBAR_STYLE}
          >
            {items.map((event, index) => (
              <article
                key={`event-${index}`}
                className="group flex min-w-[85vw] shrink-0 snap-center cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-800 bg-[#111] transition-all duration-300 md:min-w-[45vw] lg:min-w-[30%] lg:hover:-translate-y-2"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={event.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-cover transition-transform duration-700 lg:group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 transition-colors lg:group-hover:bg-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white lg:text-xl">{event.title}</h3>
                  <div className="mb-6 flex flex-col gap-1 text-sm text-gray-400">
                    <span>{event.date}</span>
                    <span>{event.location}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-auto w-max rounded-full border border-yellow-500 px-6 py-2 text-sm font-semibold text-yellow-500 transition-colors lg:group-hover:bg-yellow-500 lg:group-hover:text-black"
                  >
                    {t("events.detailButton")}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="mx-auto mt-4 flex shrink-0 items-center gap-2 pb-2 font-semibold text-white transition-colors hover:text-yellow-500"
          >
            {t("events.viewAll")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
