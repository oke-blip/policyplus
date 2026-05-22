"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import { getMethodologyIcon, getDefaultMethodologyIconId } from "@/lib/methodology-icons";
import {
  getMethodologyPoints,
  parseMethodologyItems,
  type MethodologyStep,
} from "@/lib/settings-utils";
import { cn } from "@/lib/utils";
import { MoveRight } from "lucide-react";

function pickSettingsField(
  raw: Record<string, unknown> | undefined,
  key: string,
  locale: ContentLocale,
  fallback: string,
): string {
  const en = typeof raw?.[key] === "string" ? raw[key] : undefined;
  const id = typeof raw?.[`${key}_id`] === "string" ? raw[`${key}_id`] : undefined;
  const picked = pickLocalized(locale, en as string | undefined, id as string | undefined);
  return picked.trim() || fallback;
}

function toLocalizedMethodologySteps(raw: unknown, locale: ContentLocale): MethodologyStep[] {
  return parseMethodologyItems(raw).map((item, index) => {
    const pointsEn = getMethodologyPoints(item);
    const pointsId = item.points_id?.map((p) => p.trim()).filter(Boolean);
    const points =
      locale === "id" && pointsId && pointsId.length > 0 ? pointsId : pointsEn;
    const stepNum = String(index + 1).padStart(2, "0");

    return {
      id: stepNum,
      title: pickLocalized(locale, item.title, item.title_id) || `STEP ${stepNum}`,
      points,
      icon: item.icon,
    };
  });
}

function StepCardContent({
  step,
  Icon,
  titleClassName,
}: {
  step: MethodologyStep;
  Icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  titleClassName?: string;
}) {
  return (
    <>
      {/* Icon - Diperbesar sedikit */}
      <span className="mb-4 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 group-hover:scale-110 group-hover:bg-yellow-500/20 transition-all duration-300">
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>

      {/* Title - Lebih Besar */}
      <h3
        className={cn(
          "mb-3 text-center text-sm font-bold uppercase tracking-[0.15em] text-white lg:text-base transition-colors group-hover:text-yellow-500",
          titleClassName
        )}
      >
        {step.title}
      </h3>

      {/* Points - Lebih Besar & Mudah Dibaca */}
      {step.points.length > 0 ? (
        <ul className="list-disc space-y-1.5 pl-4 text-left text-xs leading-relaxed text-gray-300 marker:text-yellow-500 lg:space-y-2 lg:text-[13px]">
          {step.points.map((point, pointIndex) => (
            <li key={`${point}-${pointIndex}`}>{point}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export function MethodologySection({
  data,
  initialSteps,
}: {
  data?: Record<string, unknown>;
  initialSteps?: MethodologyStep[];
}) {
  const { t, locale } = useLanguage();
  const [fetchedMethodologyRaw, setFetchedMethodologyRaw] = useState<unknown>(null);

  const tag = pickSettingsField(data, "methodology_tag", locale, String(t("methodology.tag")));
  const header = pickSettingsField(
    data,
    "methodology_header",
    locale,
    String(t("methodology.header")),
  );
  const description = pickSettingsField(
    data,
    "methodology_description",
    locale,
    String(t("methodology.description")),
  );

  const cmsSteps = useMemo(() => {
    if (data?.methodology_items != null) {
      return toLocalizedMethodologySteps(data.methodology_items, locale);
    }
    if (initialSteps?.length) return initialSteps;
    return [] as MethodologyStep[];
  }, [data?.methodology_items, initialSteps, locale]);

  useEffect(() => {
    if (cmsSteps.length > 0) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((settings) => {
        if (settings.methodology_items != null) {
          setFetchedMethodologyRaw(settings.methodology_items);
        }
      })
      .catch(() => {});
  }, [cmsSteps.length]);

  const fetchedSteps = useMemo(
    () =>
      fetchedMethodologyRaw != null
        ? toLocalizedMethodologySteps(fetchedMethodologyRaw, locale)
        : [],
    [fetchedMethodologyRaw, locale],
  );

  const fallbackSteps = t<MethodologyStep[]>("methodology.steps");
  const steps =
    cmsSteps.length > 0
      ? cmsSteps
      : fetchedSteps.length > 0
        ? fetchedSteps
        : fallbackSteps;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    },
  };

  const lineVariants: Variants = {
    hidden: { scaleX: 0 },
    show: { 
      scaleX: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  if (steps.length === 0) return null;

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-32 pb-16 text-white lg:pt-36 lg:pb-24 overflow-hidden">
      {/* Ambient Glow - DNA Policy+ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] right-[-10%] -z-10 h-[60vh] w-[60vw] rounded-full bg-yellow-500/[0.03] blur-[140px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        
        {/* HEADER - Teks Lebih Besar */}
        <motion.header 
          className="mx-auto mb-16 max-w-4xl shrink-0 text-center lg:mb-24"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block rounded-full border border-gray-800 bg-[#0a0a0a] px-5 py-2 text-xs font-bold tracking-[0.2em] text-yellow-500 uppercase shadow-lg">
            {tag}
          </span>
          <h2 className="mt-6 break-words font-sans text-4xl font-extrabold leading-tight tracking-tight text-white hyphens-auto sm:text-5xl lg:text-6xl">
            {header}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-gray-400 sm:text-lg lg:text-xl">
            {description}
          </p>
        </motion.header>

        {/* STEPS CONTAINER */}
        <motion.div 
          className="relative flex flex-1 flex-col lg:flex-row lg:items-start lg:justify-center gap-12 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step, index) => {
            const Icon = getMethodologyIcon(
              step.icon || getDefaultMethodologyIconId(index)
            );
            const isLast = index === steps.length - 1;

            return (
              <div key={`m-${step.id}-${index}`} className="relative flex-1 flex flex-col items-center lg:items-start group">
                
                {/* Horizontal Connector Line & Arrow (Desktop Only) */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px z-0">
                    <motion.div 
                      className="w-full h-full bg-gray-800 origin-left"
                      variants={lineVariants}
                    />
                    <motion.div
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-700"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + index * 0.2 }}
                    >
                      <MoveRight size={16} strokeWidth={1}/>
                    </motion.div>
                  </div>
                )}

                {/* Vertical Connector Line (Mobile Only) */}
                {!isLast && (
                  <div className="absolute left-7 top-14 w-px h-[calc(100%+3rem)] bg-gray-800 lg:hidden z-0" />
                )}

                {/* Number Circle - Animated Popping */}
                <div className="relative z-10 flex items-center justify-center mb-6 lg:mb-10 lg:w-full lg:justify-center">
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-yellow-500 bg-[#0a0a0a] text-lg font-black text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] shrink-0"
                    initial={{ scale: 0, opacity: 0 }}
                    variants={{
                      show: { 
                        scale: 1, 
                        opacity: 1,
                        transition: { type: "spring", stiffness: 200, damping: 15, delay: index * 0.1 }
                      }
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(234,179,8,0.3)",
                        "0 0 30px rgba(234,179,8,0.5)",
                        "0 0 20px rgba(234,179,8,0.3)",
                      ],
                    }}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    {step.id}
                  </motion.div>
                </div>

                {/* Card - Animated popping & Hover effect */}
                <motion.div
                  className="relative z-10 w-full min-w-0 overflow-hidden rounded-3xl border border-gray-800/50 bg-[#0a0a0a] p-6 shadow-xl transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:border-yellow-500/40 group-hover:shadow-yellow-500/10 sm:p-8 flex flex-col items-center"
                  variants={cardVariants}
                >
                  <StepCardContent step={step} Icon={Icon} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}