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

        <div className="mt-8 flex flex-col gap-16 pb-6 lg:mt-10">
          {items.map((event) => (
            <article
              key={event.title}
              className="group flex flex-col md:flex-row h-auto md:h-[75vh] min-h-[500px] w-full snap-start snap-always cursor-pointer overflow-hidden rounded-3xl border border-gray-800 bg-[#111] transition-all duration-300 hover:border-yellow-500/50"
            >
            <div className="relative h-64 md:h-full md:w-1/2 overflow-hidden shrink-0">
              <Image
                src={event.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
            </div>

            <div className="flex flex-1 flex-col justify-center p-8 md:p-12 lg:p-16">
              <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl lg:text-4xl leading-tight">{event.title}</h3>
              <div className="mb-8 flex flex-col gap-3 text-base text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  {event.date}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  {event.location}
                </span>
              </div>
              <button
                type="button"
                className="w-max rounded-full border border-yellow-500 px-8 py-3 text-sm font-bold text-yellow-500 transition-colors group-hover:bg-yellow-500 group-hover:text-black"
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
