"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

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
] as const;

const LAYOUT_SPRING = { type: "spring" as const, stiffness: 260, damping: 20 };

function selectCard(
  e: React.KeyboardEvent,
  index: number,
  setIndex: (i: number) => void
) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    setIndex(index);
  }
}

export function ApproachSection() {
  const { t } = useLanguage();
  const items = t<ApproachItem[]>("approach.items");
  const [hoveredIndex, setHoveredIndex] = React.useState(0);

  return (
    <section className="overflow-hidden bg-gray-950 py-32 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-400 bg-clip-text text-3xl font-black uppercase tracking-tighter text-transparent drop-shadow-[0_0_28px_rgba(234,179,8,0.5)] md:text-5xl md:leading-[1.05]">
            {t("approach.header")}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-gray-400 md:text-lg">
            {t("approach.description")}
          </p>
        </header>

        <div className="mx-auto mt-16 flex h-[70vh] w-full max-w-7xl flex-col gap-4 px-0 lg:flex-row">
          {items.map((item, index) => {
            const isActive = hoveredIndex === index;
            const phaseLabel = `PHASE_0${index + 1}`;

            return (
              <motion.div
                key={`approach-card-${item.title}`}
                layout
                transition={LAYOUT_SPRING}
                className={cn(
                  "relative flex-shrink-0 cursor-pointer touch-manipulation overflow-hidden rounded-3xl outline-none transition-[flex-grow,flex-shrink,flex-basis] duration-500 ease-out",
                  "focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-4 focus-visible:ring-offset-gray-950 focus-visible:outline-none",
                  isActive ? "flex-[1] lg:flex-[3]" : "flex-[0.5] lg:flex-[0.5]"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                onClick={() => setHoveredIndex(index)}
                onKeyDown={(e) => selectCard(e, index, setHoveredIndex)}
                tabIndex={0}
                role="button"
                aria-expanded={isActive}
                aria-controls={`approach-panel-${index}`}
                aria-label={`${phaseLabel}: ${item.title}. Tap, click, or press Enter or Space to select this card.`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={APPROACH_IMAGES[index]?.src}
                  alt={APPROACH_IMAGES[index]?.alt ?? item.title}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out",
                    isActive ? "opacity-100 grayscale-0 blur-0" : "opacity-50 grayscale blur-[2px]"
                  )}
                />

                {/* Tall, dark stack so body copy stays legible on bright imagery */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 via-35% to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent"
                />

                <div className="absolute left-4 top-4 z-10 rounded-md border border-yellow-500/70 bg-gray-950/80 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-400 shadow-[0_0_18px_rgba(234,179,8,0.35)] backdrop-blur-sm">
                  {phaseLabel}
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-[1] flex h-full flex-col justify-end p-6 md:p-8">
                  <h3
                    id={`approach-title-${index}`}
                    className={cn(
                      "mb-2 font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] transition-all duration-500 ease-out md:mb-3",
                      "text-xl md:text-2xl lg:text-3xl",
                      isActive
                        ? "max-w-none translate-x-0 rotate-0 opacity-100"
                        : "opacity-70 lg:max-h-[min(60%,12rem)] lg:origin-bottom-left lg:translate-x-1 lg:rotate-180 lg:text-lg lg:[writing-mode:vertical-rl]",
                      isActive ? "whitespace-normal" : "whitespace-normal lg:whitespace-nowrap"
                    )}
                  >
                    {item.title}
                  </h3>

                  <AnimatePresence initial={false} mode="sync">
                    {isActive && (
                      <motion.div
                        id={`approach-panel-${index}`}
                        role="region"
                        aria-labelledby={`approach-title-${index}`}
                        key={`desc-${index}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                          className="max-w-prose pt-1 text-sm leading-relaxed text-gray-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] md:text-base"
                        >
                          {item.desc}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
