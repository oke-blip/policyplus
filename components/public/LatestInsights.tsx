"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

type InsightItem = {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
};

export function LatestInsights() {
  const { t } = useLanguage();
  const items = t<InsightItem[]>("insights.items").slice(0, 3);

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-7%] bottom-[-10%] -z-10 h-[50vh] w-[48vw] rounded-full bg-yellow-500/5 blur-[100px]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4">
        <h2 className="w-full text-center text-3xl font-bold text-white sm:text-4xl">{t("insights.header")}</h2>

        <div className="mt-8 grid w-full grid-cols-1 gap-6 pb-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {items.map((post) => (
            <article
              key={post.title}
              className="group flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-800 bg-[#111] transition-all duration-300 hover:-translate-y-2"
            >
            <div className="relative h-44 w-full shrink-0 overflow-hidden sm:h-48 lg:h-44">
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                <span className="size-6 shrink-0 rounded-full bg-gray-600" aria-hidden />
                <span className="font-medium text-gray-300">{post.author}</span>
                <span className="text-gray-600" aria-hidden>
                  ·
                </span>
                <span>{post.date}</span>
              </div>

              <h3 className="mb-2 line-clamp-2 text-lg leading-snug font-bold text-white lg:text-xl">
                {post.title}
              </h3>
              <p className="mb-5 line-clamp-3 text-sm text-gray-400">{post.excerpt}</p>

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
          className="mx-auto mt-4 flex shrink-0 items-center gap-3 rounded-full bg-yellow-500 px-6 py-3 font-bold text-black transition-colors hover:bg-yellow-400 lg:mt-6"
        >
          {t("insights.readAll")}
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </button>
      </div>
    </section>
  );
}
