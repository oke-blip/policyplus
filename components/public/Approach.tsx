"use client";

import Image from "next/image";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type ApproachItem = {
  title: string;
  desc: string;
};

const APPROACH_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1500",
    alt: "Circuit technology",
  },
  {
    src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1500",
    alt: "Cyber security abstract",
  },
  {
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1500",
    alt: "Digital matrix",
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1500",
    alt: "Global connectivity",
  },
] as const;

const hoverRevealClass = cn(
  "transition-all duration-500 ease-out",
  "max-lg:translate-x-0 max-lg:opacity-100",
  "lg:translate-x-8 lg:opacity-0",
  "lg:group-hover:translate-x-0 lg:group-hover:opacity-100",
  "lg:group-focus-within:translate-x-0 lg:group-focus-within:opacity-100",
  "lg:group-active:translate-x-0 lg:group-active:opacity-100"
);

export function ApproachSection() {
  const { t } = useLanguage();
  const items = t<ApproachItem[]>("approach.items").slice(0, 4);

  return (
    <section className="relative flex min-h-svh w-full snap-start scroll-mt-24 flex-col overflow-x-hidden bg-gray-950 pb-20 text-white lg:scroll-mt-32 lg:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none font-sans text-4xl text-white/5"
      >
        <span className="absolute top-20 left-[8%]">+</span>
        <span className="absolute top-1/3 right-[12%] text-3xl">+</span>
        <span className="absolute bottom-24 right-[18%]">+</span>
        <span className="absolute bottom-32 left-[22%] text-3xl">+</span>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-start px-4 py-6 font-sans lg:min-h-0 lg:flex-1 lg:justify-center lg:py-10">
        <header className="mx-auto mb-10 max-w-4xl shrink-0 text-center lg:mb-12">
          <h2 className="text-2xl font-bold uppercase leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[2.9rem]">
            <span className="block text-white">{String(t("approach.headerLine1"))}</span>
            <span className="mt-1 block text-yellow-500 sm:mt-2">{String(t("approach.headerLine2"))}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-400 sm:mt-5 sm:text-base md:text-lg">
            {t("approach.description")}
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
          {items.map((item, index) => {
            const meta = APPROACH_IMAGES[index] ?? APPROACH_IMAGES[0];
            const phaseLabel = `PHASE_0${index + 1}`;

            return (
              <div
                key={`approach-card-${item.title}`}
                className="group relative h-[240px] w-full cursor-pointer overflow-hidden rounded-2xl outline-none focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-950 sm:h-[250px] lg:h-[230px]"
                tabIndex={0}
                role="article"
                aria-label={`${phaseLabel}: ${item.title}`}
              >
                <Image
                  src={meta.src}
                  alt={meta.alt}
                  fill
                  className="object-cover transition-opacity duration-500 group-hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/75 via-40% to-transparent"
                />

                <div className="absolute left-4 top-4 z-10 rounded-md border border-yellow-500/60 bg-gray-950/85 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-400 backdrop-blur-sm">
                  {phaseLabel}
                </div>

                <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col justify-end p-5 md:p-6">
                  <div className={hoverRevealClass}>
                    <h3 className="text-lg font-bold leading-snug text-white md:text-xl lg:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-200 md:text-base">{item.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
