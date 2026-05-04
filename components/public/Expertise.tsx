"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

type ExpertiseItem = {
  tag: string;
  title: string;
  desc: string;
};

const EXPERTISE_IMAGES = [
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1500",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1500",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1500",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1500",
] as const;

const revealInView = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" as const },
  viewport: { once: true, margin: "-100px" },
};

export function ExpertiseSection() {
  const { t } = useLanguage();
  const items = t<ExpertiseItem[]>("expertise.items");

  return (
    <section id="expertise" className="py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div {...revealInView}>
          <p className="text-center text-sm font-semibold tracking-widest text-yellow-600 uppercase dark:text-yellow-500">
            {t("expertise.header")}
          </p>
          <p className="mx-auto mt-4 max-w-4xl text-center text-2xl text-gray-900 md:text-4xl dark:text-white">
            {t("expertise.description")}
          </p>
        </motion.div>

        <div className="mt-16 space-y-16 lg:space-y-24">
          {items.map((item, index) => {
            const isOdd = index % 2 === 1;
            const image = EXPERTISE_IMAGES[index % EXPERTISE_IMAGES.length];

            return (
              <motion.article
                key={`${item.title}-${index}`}
                {...revealInView}
                className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24"
              >
                <div className={isOdd ? "lg:order-last" : ""}>
                  <span className="mb-6 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {item.tag}
                  </span>
                  <h3 className="mb-4 text-3xl leading-tight font-bold text-gray-900 lg:text-4xl dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                    {item.desc}
                  </p>

                  <button
                    type="button"
                    className="group inline-flex items-center gap-3 text-sm font-semibold text-gray-900 transition-colors hover:text-yellow-600 dark:text-gray-100 dark:hover:text-yellow-400"
                  >
                    <span>{t("expertise.readMore")}</span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500 text-white">
                      <span
                        aria-hidden="true"
                        className="inline-block transform transition duration-300 group-hover:translate-x-2"
                      >
                        →
                      </span>
                    </span>
                  </button>
                </div>

                <div className={isOdd ? "lg:order-first" : ""}>
                  <div className="overflow-hidden rounded-3xl shadow-2xl">
                    {/* Intentional plain img to avoid remote image config overhead */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
