"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

type EventItem = {
  title: string;
  date: string;
  location: string;
  image: string;
};

export function UpcomingEvents() {
  const { t } = useLanguage();
  const items = t<EventItem[]>("events.items").slice(0, 3);

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[55vh] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.06] blur-[110px]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-4">
        <h2 className="w-full text-center text-3xl font-bold text-white sm:text-4xl">{t("events.header")}</h2>

        <div className="mt-8 grid grid-cols-1 gap-6 pb-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {items.map((event) => (
            <article
              key={event.title}
              className="group flex h-[min(52vh,430px)] cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-800 bg-[#111] transition-all duration-300 hover:-translate-y-2"
            >
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={event.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white lg:text-xl">{event.title}</h3>
              <div className="mb-6 flex flex-col gap-1 text-sm text-gray-400">
                <span>{event.date}</span>
                <span>{event.location}</span>
              </div>
              <button
                type="button"
                className="mt-auto w-max rounded-full border border-yellow-500 px-6 py-2 text-sm font-semibold text-yellow-500 transition-colors group-hover:bg-yellow-500 group-hover:text-black"
              >
                {t("events.detailButton")}
              </button>
            </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="mx-auto mt-4 flex shrink-0 items-center gap-2 font-semibold text-white transition-colors hover:text-yellow-500"
        >
          {t("events.viewAll")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
