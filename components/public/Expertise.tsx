"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { asArray } from "@/lib/utils";
import {
  SECTION_HEADER,
  SECTION_SCROLL_BODY,
  SECTION_SCROLL_STYLE,
  SNAP_SECTION,
} from "@/lib/section-shell";

type ExpertiseItem = {
  tag: string;
  title: string;
  desc: string;
};

/** Premium placeholders: corporate workspace, meetings, data analysis */
const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
] as const;

/** Mobile: auto height + deck swipe; desktop: fixed fluid band */
const cardShell =
  "h-auto min-h-[300px] max-h-[min(72vh,620px)] lg:h-[55vh] lg:min-h-[380px] lg:max-h-[550px]";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const badgeClass =
  "inline-flex rounded-full border px-2.5 py-0.5 text-[8px] tracking-widest uppercase leading-none sm:px-3 sm:py-1 sm:text-[9px] 2xl:text-[10px]";

export function ExpertiseSection() {
  const { t } = useLanguage();
  const allItems = asArray<ExpertiseItem>(t("expertise.items"));
  const items = allItems.slice(0, 3);

  return (
    <section id="expertise" className={`${SNAP_SECTION} isolate text-white`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[25] bg-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-[-5%] -z-10 h-[50vh] w-[40vw] rounded-full bg-yellow-500/5 blur-[120px]"
      />
      <motion.header
        className={`${SECTION_HEADER} text-center lg:text-center`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-500 uppercase sm:text-xs">
          {t("expertise.header")}
        </p>
        <p className="mx-auto mt-2 max-w-3xl text-balance text-sm leading-relaxed text-gray-300 sm:mt-3 sm:text-base md:text-lg">
          {t("expertise.description")}
        </p>
      </motion.header>

      <div className={SECTION_SCROLL_BODY} style={SECTION_SCROLL_STYLE}>
        <motion.div
          className="mx-auto flex min-h-0 w-full max-w-7xl flex-row snap-x snap-mandatory gap-4 overflow-x-auto px-4 [-webkit-overflow-scrolling:touch] hide-scrollbar touch-pan-x lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {items.map((item, index) => {
            const imageSrc = CARD_IMAGES[index] ?? CARD_IMAGES[0];
            const isAccent = index === 1;

            if (isAccent) {
              return (
                <motion.article
                  key={`expertise-card-${index}`}
                  variants={cardVariants}
                  className={`group relative flex ${cardShell} min-w-[85vw] shrink-0 cursor-pointer snap-center flex-col overflow-hidden rounded-[2rem] bg-yellow-500 p-4 pb-16 text-black transition-all duration-500 sm:rounded-[2.5rem] sm:p-6 sm:pb-20 lg:min-w-0 lg:hover:-translate-y-2`}
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl lg:aspect-auto lg:h-[40%] lg:min-h-[140px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 lg:group-hover:scale-105"
                    />
                  </div>

                  <div className="relative flex min-h-0 flex-1 flex-col justify-end pr-11 pt-3 sm:pr-14 sm:pt-4">
                    <span
                      className={`${badgeClass} w-fit border-black/20 text-black/70`}
                    >
                      {item.tag}
                    </span>
                    <h3 className="mt-3 text-xl font-bold leading-tight text-black line-clamp-3 lg:text-2xl 2xl:mt-6 2xl:text-3xl">
                      {item.title}
                    </h3>
                  </div>

                  <span className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-colors duration-300 sm:right-6 sm:bottom-6 sm:h-11 sm:w-11 lg:group-hover:bg-white lg:group-hover:text-black">
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                  </span>
                </motion.article>
              );
            }

            return (
              <motion.article
                key={`expertise-card-${index}`}
                variants={cardVariants}
                className={`group relative flex ${cardShell} min-w-[85vw] shrink-0 cursor-pointer snap-center flex-col overflow-hidden rounded-[2rem] border border-gray-800 bg-[#111] p-4 transition-all duration-500 sm:rounded-[2.5rem] sm:p-6 lg:min-w-0 lg:hover:-translate-y-2`}
              >
                <div className="flex shrink-0 items-start justify-between gap-2">
                  <span
                    className={`${badgeClass} border-gray-700 text-gray-400`}
                  >
                    {item.tag}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white transition-colors duration-300 sm:h-11 sm:w-11 lg:group-hover:bg-yellow-500 lg:group-hover:text-black">
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-bold leading-tight text-white line-clamp-3 lg:mt-4 lg:text-2xl 2xl:mt-6 2xl:text-3xl">
                  {item.title}
                </h3>

                <div className="relative mt-auto aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl lg:aspect-auto lg:h-[40%] lg:min-h-[140px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 lg:group-hover:scale-105"
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
