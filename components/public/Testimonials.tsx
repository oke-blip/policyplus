"use client";

import Image from "next/image";

import { useLanguage } from "@/contexts/LanguageContext";

type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  image: string;
};

export function Testimonials({ data }: { data?: any }) {
  const { t } = useLanguage();
  
  const header = data?.testimonials_header || t("testimonials.header");
  const items = data?.testimonials && data.testimonials.length > 0 
    ? data.testimonials.map((i: any) => ({
        quote: i.quote,
        author: i.author,
        role: i.role,
        image: i.image
      }))
    : t<TestimonialItem[]>("testimonials.items");

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-8%] left-[-6%] -z-10 h-[48vh] w-[44vw] rounded-full bg-yellow-500/5 blur-[100px]"
      />
      <header className="relative z-10 mx-auto w-full max-w-7xl shrink-0 px-4 text-center">
        <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-white sm:text-2xl md:text-3xl">
          {header}
        </h2>
      </header>

      <div className="relative z-10 mx-auto mt-10 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:mt-12 lg:grid-cols-3 lg:gap-8">
        {items.map((item) => (
          <article
            key={`${item.author}-${item.role}`}
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
    </section>
  );
}
