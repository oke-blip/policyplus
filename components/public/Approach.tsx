"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getLatestApproachItems,
  type ApproachItem,
} from "@/lib/settings-utils";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1500",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1500",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1500",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1500",
] as const;

const LANDING_LIMIT = 4;

export function ApproachSection({
  data,
  initialItems,
}: {
  data?: Record<string, unknown>;
  initialItems?: ApproachItem[];
}) {
  const { t } = useLanguage();
  const [fetchedItems, setFetchedItems] = useState<ApproachItem[]>([]);

  const line1 = String(data?.approach_line1 || "WHAT MAKES");
  const line2 = String(data?.approach_line2 || "OUR APPROACH DIFFERENT?");
  const description = String(
    data?.approach_description ||
      "Our work connects research, stakeholders, and communication to move policy ideas from discussion to implementation."
  );

  const cmsItems = useMemo(() => {
    if (initialItems?.length) return initialItems.slice(0, LANDING_LIMIT);
    return getLatestApproachItems(data?.approach_items, LANDING_LIMIT);
  }, [initialItems, data?.approach_items]);

  useEffect(() => {
    if (cmsItems.length > 0) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((settings) => {
        const fromApi = getLatestApproachItems(settings.approach_items, LANDING_LIMIT);
        if (fromApi.length > 0) setFetchedItems(fromApi);
      })
      .catch(() => {});
  }, [cmsItems.length]);

  const fallbackItems = t<ApproachItem[]>("approach.items").slice(0, LANDING_LIMIT);
  const items =
    cmsItems.length > 0
      ? cmsItems
      : fetchedItems.length > 0
        ? fetchedItems
        : fallbackItems;

  return (
    <section className="relative flex min-h-svh w-full snap-start scroll-mt-24 flex-col overflow-x-hidden bg-gray-950 pb-20 text-white lg:scroll-mt-32 lg:pb-20">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none font-sans text-4xl text-white/5"
      >
        <span className="absolute top-20 left-[8%]">+</span>
        <span className="absolute top-1/3 right-[12%] text-3xl">+</span>
        <span className="absolute bottom-24 right-[18%]">+</span>
        <span className="absolute bottom-32 left-[22%] text-3xl">+</span>
      </motion.div>

      <motion.div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-start px-4 py-6 font-sans lg:min-h-0 lg:flex-1 lg:justify-center lg:py-10">
        <header className="mx-auto mb-10 max-w-4xl shrink-0 text-center lg:mb-12">
          <h2 className="text-2xl font-bold uppercase leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[2.9rem]">
            <span className="block text-white">{line1}</span>
            <span className="mt-1 block text-yellow-500 sm:mt-2">{line2}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-400 sm:mt-5 sm:text-base md:text-lg">
            {description}
          </p>
        </header>

        <div className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={`${item.id ?? item.title}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-gray-900/50 p-8 transition-all hover:border-yellow-500/30"
            >
              <div className="absolute inset-0 z-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                  alt=""
                  className="h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-1 flex-col">
                <span className="mb-6 inline-flex w-fit rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-yellow-500">
                  {item.phase || `PHASE_0${i + 1}`}
                </span>

                <div className="mt-auto">
                  <h3 className="mb-4 translate-y-4 text-2xl font-bold leading-tight text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {item.title}
                  </h3>
                  <p className="translate-y-4 text-sm leading-relaxed text-gray-400 opacity-0 transition-all delay-75 duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}