"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Mirrors future Headless CMS article payload (e.g. Sanity). */
export interface KnowledgeArticle {
  id: number;
  category: string;
  title: string;
  preview: string;
  image: string;
}

/** Scrollbars hidden: Firefox + legacy IE/Edge; WebKit uses `.hide-scrollbar` in globals.css */
const HIDDEN_SCROLLBAR_STYLE: React.CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export function KnowledgeCenterSection() {
  const { t } = useLanguage();
  const filters = t<string[]>("knowledge.filters");

  const allLabel = filters[0] ?? "All";
  const [selectedFilter, setSelectedFilter] = React.useState<string | null>(null);
  const activeFilter = selectedFilter ?? allLabel;

  /** Simulates async CMS fetch; swap this effect for `fetch('/api/knowledge')` later. */
  const [articles, setArticles] = React.useState<KnowledgeArticle[]>([]);

  React.useLayoutEffect(() => {
    let cancelled = false;

    async function fetchKnowledgeFromCms(): Promise<void> {
      await Promise.resolve();
      const payload = t<KnowledgeArticle[]>("knowledge.items");
      if (!cancelled) setArticles(payload);
    }

    fetchKnowledgeFromCms();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const filteredArticles = (() => {
    if (activeFilter === allLabel) return articles;
    return articles.filter((item) => item.category === activeFilter);
  })();

  const visibleArticles = filteredArticles.slice(0, 3);

  return (
    <section
      id="knowledge"
      className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[20%] right-[-10%] -z-10 h-[60vh] w-[40vw] rounded-full bg-yellow-500/5 blur-[120px]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4">
        <header className="mx-auto max-w-3xl shrink-0 text-center">
          <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-white sm:text-2xl md:text-3xl">
            {t("knowledge.header")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:mt-4 sm:text-base">
            {t("knowledge.description")}
          </p>
        </header>

        <div
          className="mx-auto mt-8 flex max-w-7xl gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] hide-scrollbar"
          style={HIDDEN_SCROLLBAR_STYLE}
        >
          {filters.map((label) => {
            const isActive = activeFilter === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setSelectedFilter(label === allLabel ? null : label);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-300 sm:text-sm",
                  isActive
                    ? "border-yellow-500 bg-yellow-500 text-black"
                    : "border-gray-800 bg-[#111] text-gray-400 hover:text-gray-200"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-8 grid w-full grid-cols-1 gap-6 pb-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleArticles.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="group relative flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-gray-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 lg:group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"
                />

                <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-6 transition-transform duration-500 ease-out translate-y-0 lg:translate-y-[3.5rem] lg:group-hover:translate-y-0">
                  <span className="inline-flex w-fit rounded-full bg-yellow-500 px-3 py-1 text-[10px] font-semibold tracking-wider text-black uppercase">
                    {item.category}
                  </span>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-white md:text-xl">
                    {item.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-3 text-sm text-gray-400 line-clamp-3 transition-opacity duration-500 delay-100",
                      "opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    )}
                  >
                    {item.preview}
                  </p>
                </div>

                <Link
                  href="/blog"
                  className="absolute inset-0 z-10 rounded-[2rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
                  aria-label={item.title}
                />
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex shrink-0 justify-center">
          <Button
            asChild
            className="h-11 rounded-full border-0 bg-yellow-500 px-8 text-sm font-semibold text-black shadow-lg hover:bg-yellow-400"
          >
            <Link href="/blog">{String(t("knowledge.cta"))}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
