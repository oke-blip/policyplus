"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { FileText, Lightbulb, Search, Settings, Users } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { asArray, cn } from "@/lib/utils";
import {
  SECTION_HEADER,
  SECTION_SCROLL_BODY,
  SECTION_SCROLL_STYLE,
  SNAP_SECTION,
} from "@/lib/section-shell";

type MethodologyStep = {
  id: string;
  title: string;
  points: string[];
};

const STEP_ICONS = [Lightbulb, Search, Users, FileText, Settings] as const;

/** Ascending staircase (step up left → right): leftmost lowest, rightmost highest */
const STAIR_OFFSET_VH = [12, 9, 6, 3, 0] as const;

function columnStairTranslateY(index: number): string {
  const v = STAIR_OFFSET_VH[Math.min(index, STAIR_OFFSET_VH.length - 1)] ?? 0;
  return `${v}vh`;
}

/** Vertical dash from pedestal to numbered circle — shorter on the right where cards sit higher */
function connectorHeightPx(index: number): number {
  const heights = [34, 28, 22, 16, 10] as const;
  return heights[Math.min(index, heights.length - 1)] ?? 12;
}

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.08 },
  },
};

const desktopStepVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
};

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
      <ul className="list-disc space-y-0.5 pl-3 text-left text-[11px] leading-snug text-gray-400 marker:text-yellow-500 lg:space-y-1 lg:pl-3.5 lg:text-xs">
        {asArray<string>(step.points).map((point, i) => (
          <li key={`${step.id}-pt-${i}`}>{point}</li>
        ))}
      </ul>
    </>
  );
}

const CARD_BOX =
  "relative z-10 flex h-[30vh] min-h-[220px] max-h-[320px] w-full flex-col overflow-hidden rounded-t-xl border border-gray-800 bg-[#111] p-4 shadow-xl lg:p-5";

export function MethodologySection() {
  const { t } = useLanguage();
  const steps = asArray<MethodologyStep>(t("methodology.steps"));

  return (
    <section className={`${SNAP_SECTION} isolate text-white`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[25] bg-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[-10%] -z-10 h-[50vh] w-[50vw] rounded-full bg-white/5 blur-[120px]"
      />

      <div className={`${SECTION_HEADER} max-w-4xl text-center lg:text-center`}>
        <span className="inline-block rounded-full border border-gray-700 bg-[#111] px-3 py-1 text-[10px] font-semibold tracking-wide text-yellow-500 uppercase sm:px-4 sm:py-1.5 sm:text-xs">
          {t("methodology.tag")}
        </span>
        <h2 className="mt-3 break-words font-serif text-3xl font-bold leading-tight tracking-tight text-white hyphens-auto lg:text-5xl">
          {t("methodology.header")}
        </h2>
        <p className="mt-2 text-sm leading-snug text-gray-400 sm:text-base">
          {t("methodology.description")}
        </p>
      </div>

      <div className={SECTION_SCROLL_BODY} style={SECTION_SCROLL_STYLE}>
        <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6">
            {/* ——— Mobile: horizontal swipe deck (no staircase — saves vertical space) ——— */}
            <div className="relative mt-2 block min-h-0 lg:hidden">
              <motion.div
                className="flex w-full flex-row gap-4 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch] hide-scrollbar snap-x snap-mandatory touch-pan-x"
                style={SECTION_SCROLL_STYLE}
                variants={containerVars}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
              >
                {steps.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? Settings;
                  return (
                    <motion.div
                      key={`m-deck-${step.id}`}
                      variants={desktopStepVars}
                      className="min-w-[85vw] shrink-0 snap-center"
                    >
                      <div className="relative flex translate-y-0 flex-col items-center">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-yellow-500 bg-[#111] text-xs font-bold text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.35)]">
                          {step.id}
                        </div>
                        <div className={cn(CARD_BOX, "mt-3 h-auto min-h-[200px] max-h-[42vh] w-full translate-y-0")}>
                          <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto">
                            <StepCardContent step={step} Icon={Icon} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* ——— Desktop: horizontal staircase (ascends left → right) ——— */}
            <div className="relative mx-auto mt-4 hidden min-h-0 w-full lg:block">
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 left-3 right-3 z-0 border-t border-dashed border-gray-700 lg:bottom-8"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left center" }}
              />

              <motion.div
                className="relative z-10 flex w-full justify-center items-start gap-3 lg:grid lg:grid-cols-5 lg:gap-4"
                variants={containerVars}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
              >
                {steps.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? Settings;
                  const connectorPx = connectorHeightPx(index);

                  return (
                    <motion.div
                      key={`d-${step.id}`}
                      variants={desktopStepVars}
                      style={{ transform: `translateY(${columnStairTranslateY(index)})` }}
                      className="group relative flex w-full flex-col items-center will-change-transform"
                    >
                      <div className="flex w-full flex-col items-center">
                        <div className="transition-all duration-500 ease-out lg:group-hover:-translate-y-0.5 lg:group-hover:shadow-[0_12px_28px_-12px_rgba(234,179,8,0.22)]">
                          <div className={CARD_BOX}>
                            <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto">
                              <StepCardContent step={step} Icon={Icon} />
                            </div>
                          </div>
                          <div className="relative z-[5] -mt-px h-8 w-full rounded-b-md bg-[#0a0a0a] shadow-lg ring-1 ring-gray-800 lg:h-9" />
                        </div>

                        <div
                          className="w-px shrink-0 border-l border-dashed border-gray-600"
                          style={{ height: `${connectorPx}px` }}
                          aria-hidden="true"
                        />

                        <div className="relative z-20 -mt-px flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-yellow-500 bg-[#111] text-[10px] font-bold text-yellow-400 shadow-sm transition-colors duration-300 lg:group-hover:bg-yellow-500 lg:group-hover:text-black lg:h-9 lg:w-9 lg:text-xs">
                          {step.id}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
      </div>
    </section>
  );
}
