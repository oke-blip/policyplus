"use client";

import type { CSSProperties } from "react";
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  SECTION_HEADER,
  SECTION_SCROLL_BODY,
  SECTION_SCROLL_STYLE,
  SNAP_SECTION,
} from "@/lib/section-shell";

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

  /** Plain strings for motion children (avoids Framer Motion vs. generic `t()` type clash). */
  const hero = {
    headlineLine1Prefix: String(t("hero.headlineLine1Prefix")),
    headlineLine1Accent: String(t("hero.headlineLine1Accent")),
    headlineLine2: String(t("hero.headlineLine2")),
    headlineLine3Prefix: String(t("hero.headlineLine3Prefix")),
    headlineLine3Accent: String(t("hero.headlineLine3Accent")),
    subheadline: String(t("hero.subheadline")),
    primaryButton: String(t("hero.primaryButton")),
    secondaryButton: String(t("hero.secondaryButton")),
  };

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
      className={cn(SNAP_SECTION, "isolate text-white")}
      aria-label="Policy Plus introduction"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[25] bg-black"
      />
      {/* Ambient center-top glow — sits above photos, below vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-10%] left-1/2 z-[1] h-[60vh] w-[60vw] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[120px]"
      />
      {/* Background carousel */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {HERO_IMAGES.map((img, i) => (
          // Unsplash backgrounds; plain img avoids next/image remotePatterns (per project setup)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
              i === imageIndex ? "opacity-100" : "opacity-0"
            }`}
            fetchPriority={i === 0 ? "high" : "low"}
          />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/90 via-black/60 to-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/80 to-black"
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-36 bg-gradient-to-b from-transparent to-black"
      />

      <div className={cn(SECTION_HEADER, "text-center lg:text-center")}>
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-4">
            <motion.h1
              className="font-sans text-[clamp(1.5rem,4.5vw,4.25rem)] font-black uppercase leading-[1.02] tracking-[-0.04em] text-balance sm:text-[clamp(1.75rem,5.5vw,4.75rem)]"
              style={headlineFont}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.span
                variants={lineVariants}
                className="block text-white"
              >
                {hero.headlineLine1Prefix}{" "}
                <span className="text-yellow-500">{hero.headlineLine1Accent}</span>
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
                {hero.headlineLine2}
              </motion.span>
              <motion.span
                variants={lineVariants}
                className="mt-1 block sm:mt-1.5"
              >
                <span className="text-white">{hero.headlineLine3Prefix} </span>
                <span className="text-yellow-500" style={headlineFont}>
                  {hero.headlineLine3Accent}
                </span>
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeUpDelayed(0.28)}
              initial="hidden"
              animate="visible"
              className="mx-auto mt-6 max-w-2xl text-pretty font-sans text-sm leading-relaxed text-gray-300 sm:mt-8 sm:text-base sm:leading-[1.65] md:text-lg md:leading-[1.7]"
            >
              {hero.subheadline}
            </motion.p>
          </div>
      </div>

      <div className={SECTION_SCROLL_BODY} style={SECTION_SCROLL_STYLE}>
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 pb-6 sm:px-8 md:px-12 lg:px-14">
          <motion.div
            variants={fadeUpDelayed(0.4)}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-6 flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:gap-4"
          >
            <Link
              href="#expertise"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-yellow-500 px-10 py-3.5 text-center text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
            >
              {hero.primaryButton}
            </Link>
            <Link
              href="/blog"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-yellow-500 bg-transparent px-10 py-3.5 text-center text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:border-yellow-400 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
            >
              {hero.secondaryButton}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
