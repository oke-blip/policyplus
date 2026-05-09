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

type InsightItem = {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
};

const HIDDEN_SCROLLBAR_STYLE: CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export function LatestInsights() {
  const { t } = useLanguage();
  const items = asArray<InsightItem>(t("insights.items"));

  return (
    <section className={`${SNAP_SECTION} isolate`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[25] bg-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-7%] bottom-[-10%] -z-10 h-[50vh] w-[48vw] rounded-full bg-yellow-500/5 blur-[100px]"
      />

      <header className={`${SECTION_HEADER} text-center lg:text-center text-white`}>
        <h2 className="text-4xl font-bold text-white">{t("insights.header")}</h2>
      </header>

      <div
        className={SECTION_SCROLL_BODY}
        style={{ ...SECTION_SCROLL_STYLE, ...HIDDEN_SCROLLBAR_STYLE }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col px-4">
          <div
            className="mx-auto mt-6 flex w-full max-w-7xl snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] hide-scrollbar lg:mt-8 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-6"
            style={HIDDEN_SCROLLBAR_STYLE}
          >
            {items.map((post, index) => (
              <article
                key={`insight-${index}`}
                className="group flex min-w-[85vw] shrink-0 snap-center cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-800 bg-[#111] transition-all duration-300 hover:-translate-y-2 md:min-w-[45vw] lg:min-w-0"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                    <span className="size-6 shrink-0 rounded-full bg-gray-600" aria-hidden />
                    <span className="font-medium text-gray-300">{post.author}</span>
                    <span className="text-gray-600" aria-hidden>
                      ·
                    </span>
                    <span>{post.date}</span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg leading-snug font-bold text-white lg:text-xl">{post.title}</h3>
                  <p className="mb-6 line-clamp-3 text-sm text-gray-400">{post.excerpt}</p>

                  <span className="mt-auto flex w-max items-center gap-2 border-b border-transparent pb-0.5 text-sm font-semibold text-white transition-colors group-hover:border-yellow-500 group-hover:text-yellow-500">
                    {t("insights.readMore")}
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </span>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="mx-auto mt-6 flex shrink-0 items-center gap-3 rounded-full bg-yellow-500 px-6 py-3 font-bold text-black transition-colors hover:bg-yellow-400 lg:mt-8"
          >
            {t("insights.readAll")}
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
