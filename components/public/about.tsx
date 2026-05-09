"use client";

import Link from "next/link";

import { useLanguage } from "@/contexts/LanguageContext";

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section className="flex h-[100svh] w-full snap-start snap-always flex-col justify-center overflow-hidden bg-gray-50 py-16 lg:py-0 dark:bg-neutral-900">
      <div className="mx-auto grid min-h-0 w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-yellow-600 uppercase dark:text-yellow-500">
            {t("about.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl dark:text-white">
            {t("about.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 md:text-lg dark:text-gray-400">
            {t("about.description")}
          </p>
          <Link
            href="#"
            className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-yellow-600 dark:text-gray-100 dark:hover:text-yellow-400"
          >
            {t("about.link")}
            <span className="transition-transform duration-300 group-hover:translate-x-1">-&gt;</span>
          </Link>
        </div>

        <div className="max-h-[38vh] overflow-hidden rounded-2xl shadow-xl lg:max-h-none">
          {/* Intentional plain img to avoid remote image config overhead for now */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1500"
            alt="Professional collaboration in discussion"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      </div>
    </section>
  );
}
