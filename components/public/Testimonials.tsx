"use client";

import Image from "next/image";

import { useLanguage } from "@/contexts/LanguageContext";
import { asArray } from "@/lib/utils";
import {
  SECTION_HEADER,
  SECTION_SCROLL_BODY,
  SECTION_SCROLL_STYLE,
  SNAP_SECTION,
} from "@/lib/section-shell";

type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  image: string;
};

export function Testimonials() {
  const { t } = useLanguage();
  const items = asArray<TestimonialItem>(t("testimonials.items"));

  return (
    <section className={`${SNAP_SECTION} isolate`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[25] bg-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-8%] left-[-6%] -z-10 h-[48vh] w-[44vw] rounded-full bg-yellow-500/5 blur-[100px]"
      />

      <header className={`${SECTION_HEADER} text-center lg:text-center text-white`}>
        <h2 className="font-serif text-xl font-bold uppercase tracking-wide text-white sm:text-2xl md:text-3xl">
          {t("testimonials.header")}
        </h2>
      </header>

      <div className={SECTION_SCROLL_BODY} style={SECTION_SCROLL_STYLE}>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={`testimonial-${index}`}
              className="flex min-h-[300px] flex-col justify-between rounded-3xl border border-gray-800 bg-[#111] p-8 lg:p-10"
            >
              <blockquote className="text-lg leading-relaxed font-light tracking-wide text-gray-100 lg:text-xl lg:leading-relaxed">
                <span className="text-yellow-500/90">&ldquo;</span>
                {item.quote}
                <span className="text-yellow-500/90">&rdquo;</span>
              </blockquote>

              <footer className="mt-10 flex items-center gap-4 border-t border-gray-800/80 pt-8">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-yellow-500/25">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{item.author}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
