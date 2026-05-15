"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseHeroBanners, type HeroBanner } from "@/lib/settings-utils";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1514565131-fce080caee45?q=80&w=2000",
    alt: "City skyline at night",
  },
  {
    src: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=2000",
    alt: "City and development",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
    alt: "Architecture and structure",
  },
] as const;

const HERO_NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function PublicHeroSection({
  data,
  initialBanners,
}: {
  data?: Record<string, unknown>;
  initialBanners?: HeroBanner[];
}) {
  const reduceMotion = useReducedMotion();
  const [imageIndex, setImageIndex] = React.useState(0);
  const [bannerImages, setBannerImages] = React.useState<HeroBanner[]>(
    initialBanners?.length ? initialBanners : []
  );
  const { t } = useLanguage();

  /** Plain strings for motion children (avoids Framer Motion vs. generic `t()` type clash). */
  const hero = {
    headlineLine1Prefix: data?.hero_line1_prefix || String(t("hero.headlineLine1Prefix")),
    headlineLine1Accent: data?.hero_line1_accent || String(t("hero.headlineLine1Accent")),
    headlineLine2Prefix: data?.hero_line2_prefix || String(t("hero.headlineLine2Prefix")),
    headlineLine2Accent: data?.hero_line2_accent || String(t("hero.headlineLine2Accent")),
    subheadline: data?.hero_description || String(t("hero.subheadline")),
    primaryButton: data?.hero_cta_text || String(t("hero.primaryButton")),
    secondaryButton: data?.hero_secondary_text || String(t("hero.secondaryButton")),
  };

  React.useEffect(() => {
    if (bannerImages.length > 0) return;

    const fromData = parseHeroBanners(data?.hero_banners);
    if (fromData.length > 0) {
      setBannerImages(fromData);
      return;
    }

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((settings) => {
        const fromApi = parseHeroBanners(settings.hero_banners);
        if (fromApi.length > 0) setBannerImages(fromApi);
      })
      .catch(() => {});
  }, [bannerImages.length, data?.hero_banners]);

  const images = bannerImages.length > 0 ? bannerImages : HERO_IMAGES;
  const imagesCount = images.length;

  React.useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setImageIndex((i) => (i + 1) % imagesCount);
    }, 6000);
    return () => window.clearInterval(id);
  }, [reduceMotion, imagesCount]);

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
      className="relative isolate flex min-h-svh w-full snap-start flex-col items-center justify-center overflow-hidden bg-black text-white"
      aria-label="Policy Plus introduction"
    >
      {/* Ambient center-top glow — sits above photos, below vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-10%] left-1/2 z-[1] h-[60vh] w-[60vw] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[120px]"
      />
      {/* Background carousel */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {images.map((img, i) => (
          <React.Fragment key={`${img.src.slice(0, 32)}-${i}`}>
            {/* Plain img: remote Unsplash URLs (no next/image remotePatterns for carousel). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                i === imageIndex ? "opacity-100" : "opacity-0"
              }`}
              fetchPriority={i === 0 ? "high" : "low"}
            />
          </React.Fragment>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/65 via-black/40 to-black/75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/55 to-black/85"
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
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-28 bg-gradient-to-b from-transparent to-black/90"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 flex-col items-center px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-0">
          <motion.h1
            className="w-full px-4 text-center font-sans text-3xl font-bold uppercase leading-tight tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl lg:leading-tight"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={lineVariants} className="text-center">
              {hero.headlineLine1Prefix}{" "}
              <span className="text-yellow-500">{hero.headlineLine1Accent}</span>
            </motion.span>
            <br className="hidden lg:block" />
            <span className="inline lg:hidden"> </span>
            <motion.span variants={lineVariants} className="text-center">
              {hero.headlineLine2Prefix}{" "}
              <span className="text-yellow-500">{hero.headlineLine2Accent}</span>
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUpDelayed(0.28)}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-6 max-w-md text-center font-sans text-sm leading-relaxed text-gray-400 lg:mt-8 lg:max-w-lg lg:text-base"
          >
            {data?.hero_description || hero.subheadline}
          </motion.p>

          <motion.div
            variants={fadeUpDelayed(0.44)}
            initial="hidden"
            animate="visible"
            className="mt-8 flex w-full flex-col items-center justify-center gap-4 px-4 sm:w-auto sm:flex-row"
          >
            <Link
              href={data?.hero_cta_link || "#expertise"}
              className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-full bg-yellow-500 px-8 py-3 text-center text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 sm:w-auto"
            >
              {data?.hero_cta_text || hero.primaryButton}
            </Link>
            <Link
              href={String(data?.hero_secondary_link || "/blog")}
              className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border border-yellow-500 bg-transparent px-8 py-3 text-center text-sm font-semibold tracking-wide text-white transition-colors duration-200 hover:border-yellow-400 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 sm:w-auto"
            >
              {hero.secondaryButton}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
