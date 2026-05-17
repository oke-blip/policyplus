"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import { getMethodologyIcon, getDefaultMethodologyIconId } from "@/lib/methodology-icons";
import {
  getMethodologyPoints,
  parseMethodologyItems,
  type MethodologyStep,
} from "@/lib/settings-utils";
import { cn } from "@/lib/utils";

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
      <span className="mb-1.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/15 text-yellow-500 lg:mb-2 lg:h-9 lg:w-9">
        <Icon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <h3
        className={cn(
          "mb-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-white lg:mb-2 lg:text-xs",
          titleClassName
        )}
      >
        {step.title}
      </h3>
      {step.points.length > 0 ? (
        <ul className="list-disc space-y-0.5 pl-3 text-left text-[11px] leading-snug text-gray-400 marker:text-yellow-500 lg:space-y-1 lg:pl-3.5 lg:text-xs">
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

  if (steps.length === 0) return null;

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 text-white lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[-10%] -z-10 h-[50vh] w-[50vw] rounded-full bg-white/5 blur-[120px]"
      />

      <div className="relative z-10 flex w-full flex-1 flex-col">
        <div className="flex w-full flex-1 flex-col justify-start py-2 xl:justify-center">
          <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col px-4 sm:px-6">
            <header className="mx-auto mb-6 max-w-3xl shrink-0 text-center lg:mb-8">
              <span className="inline-block rounded-full border border-gray-700 bg-[#111] px-3 py-1 text-[10px] font-semibold tracking-wide text-yellow-500 uppercase sm:px-4 sm:py-1.5 sm:text-xs">
                {tag}
              </span>
              <h2 className="mt-3 break-words font-sans text-3xl font-bold leading-tight tracking-tight text-white hyphens-auto lg:text-4xl xl:text-5xl">
                {header}
              </h2>
              <p className="mt-2 text-sm leading-snug text-gray-400 sm:text-base">
                {description}
              </p>
            </header>

            <div className="relative mt-5 block min-h-0">
              <div className="relative pr-1 [-webkit-overflow-scrolling:touch]">
                <motion.div
                  className="absolute bottom-0 left-6 top-0 w-0.5 origin-top bg-gradient-to-b from-yellow-500 to-gray-600"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "top" }}
                />

                {steps.map((step, index) => {
                  const Icon = getMethodologyIcon(
                    step.icon || getDefaultMethodologyIconId(index)
                  );
                  return (
                    <div
                      key={`m-${step.id}-${step.title}-${index}`}
                      className={cn(
                        "relative flex gap-4",
                        index < steps.length - 1 ? "mb-6" : ""
                      )}
                    >
                      <div className="pointer-events-none relative z-10 w-12 shrink-0">
                        <motion.div
                          className="absolute left-6 top-0 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-4 border-yellow-500 bg-[#111] text-xs font-bold text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.35)]"
                          animate={{
                            scale: [1, 1.06, 1],
                            boxShadow: [
                              "0 0 15px rgba(234,179,8,0.35)",
                              "0 0 22px rgba(234,179,8,0.55)",
                              "0 0 15px rgba(234,179,8,0.35)",
                            ],
                          }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {step.id}
                        </motion.div>
                      </div>

                      <motion.div
                        className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-gray-800 bg-[#111] p-4 shadow-lg sm:p-5"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-32px" }}
                        transition={{
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                          delay: index * 0.05,
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <StepCardContent step={step} Icon={Icon} />
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
