"use client";

import type { CSSProperties } from "react";
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const headlineFont: CSSProperties = {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  fontWeight: 900,
};

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=2000",
    alt: "City and development",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
    alt: "Architecture and structure",
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000",
    alt: "Collaboration",
  },
] as const;

const HERO_NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function PublicHeroSection() {
  const reduceMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = React.useState(0);
  const { t } = useLanguage();

  React.useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setImageIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.08,
        delayChildren: reduceMotion ? 0 : 0.06,
      },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const fadeUpDelayed = (delay: number) => ({
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: reduceMotion ? 0 : delay,
        duration: reduceMotion ? 0 : 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  });

  return (
    <section
      className="relative isolate min-h-[calc(100svh-5rem)] w-full overflow-hidden bg-[#111111] text-white"
      aria-label="Policy Plus introduction"
    >
      {/* Background carousel */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {HERO_IMAGES.map((img, i) => (
          // Unsplash backgrounds; plain img avoids next/image remotePatterns (per project setup)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
              i === imageIndex ? "opacity-100" : "opacity-0"
            }`}
            fetchPriority={i === 0 ? "high" : "low"}
          />
        ))}
      </div>

      {/* Legibility: dark wash + gold from bottom-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/55 to-black/35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_95%_75%_at_100%_100%,rgba(217,119,6,0.22),rgba(120,53,15,0.12)_38%,transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_55%_42%_at_92%_90%,rgba(251,191,36,0.12),transparent_52%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("${HERO_NOISE_DATA_URI}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl flex-col px-6 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 md:px-12 md:pb-28 md:pt-24 lg:px-14">
        <div className="flex flex-1 flex-col items-center justify-center px-1 text-center sm:px-4">
          <div className="w-full max-w-6xl">
            <motion.h1
              className="font-sans text-[clamp(1.75rem,5.5vw,4.75rem)] font-black uppercase leading-[1.02] tracking-[-0.04em] text-balance"
              style={headlineFont}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.span
                variants={lineVariants}
                className="block text-white"
              >
                {t("hero.headlineLine1Prefix")}{" "}
                <span className="text-yellow-500">{t("hero.headlineLine1Accent")}</span>
              </motion.span>
              <motion.span
                variants={lineVariants}
                className="mt-1 block text-white/95 sm:mt-1.5"
                style={{
                  ...headlineFont,
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.88)",
                  color: "transparent",
                }}
              >
                {t("hero.headlineLine2")}
              </motion.span>
              <motion.span
                variants={lineVariants}
                className="mt-1 block sm:mt-1.5"
              >
                <span className="text-white">{t("hero.headlineLine3Prefix")} </span>
                <span className="text-yellow-500" style={headlineFont}>
                  {t("hero.headlineLine3Accent")}
                </span>
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeUpDelayed(0.28)}
              initial="hidden"
              animate="visible"
              className="mx-auto mt-10 max-w-2xl text-pretty font-sans text-base leading-relaxed text-gray-300 sm:mt-12 sm:text-lg sm:leading-[1.65] md:text-xl md:leading-[1.7]"
            >
              {t("hero.subheadline")}
            </motion.p>

            <motion.div
              variants={fadeUpDelayed(0.4)}
              initial="hidden"
              animate="visible"
              className="mx-auto mt-12 flex w-full max-w-lg flex-col items-stretch justify-center gap-4 sm:mt-14 sm:max-w-none sm:flex-row sm:gap-5"
            >
              <Link
                href="#expertise"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-yellow-500 px-10 py-3.5 text-center text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                {t("hero.primaryButton")}
              </Link>
              <Link
                href="/blog"
                className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-yellow-500 bg-transparent px-10 py-3.5 text-center text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:border-yellow-400 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                {t("hero.secondaryButton")}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
