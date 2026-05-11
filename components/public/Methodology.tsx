"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { FileText, Lightbulb, Search, Settings, Users } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
        {step.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </>
  );
}

const CARD_BOX =
  "relative z-10 flex h-[35vh] min-h-[220px] max-h-[300px] w-full flex-col overflow-hidden rounded-t-xl border border-gray-800 bg-[#111] p-4 shadow-xl lg:p-5";

export function MethodologySection() {
  const { t } = useLanguage();
  const steps = t<MethodologyStep[]>("methodology.steps");

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
                {t("methodology.tag")}
              </span>
              <h2 className="mt-3 break-words font-sans text-3xl font-bold leading-tight tracking-tight text-white hyphens-auto lg:text-4xl xl:text-5xl">
                {t("methodology.header")}
              </h2>
              <p className="mt-2 text-sm leading-snug text-gray-400 sm:text-base">
                {t("methodology.description")}
              </p>
            </header>

            {/* ——— Mobile: vertical timeline (scroll via section inner wrapper) ——— */}
            <div className="relative mt-5 block min-h-0 lg:hidden">
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
                  const Icon = STEP_ICONS[index] ?? Settings;
                  return (
                    <div
                      key={`m-${step.id}-${step.title}`}
                      className={cn("relative flex gap-4", index < steps.length - 1 ? "mb-6" : "")}
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
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
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

            {/* ——— Desktop: horizontal staircase (ascends left → right) ——— */}
            <div className="relative mx-auto mt-3 hidden min-h-0 w-full max-w-7xl pb-24 lg:mt-4 lg:block lg:pb-32">
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
                className="relative z-10 grid grid-cols-5 gap-3 lg:items-start lg:gap-4"
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
                      key={`d-${step.id}-${step.title}`}
                      variants={desktopStepVars}
                      style={{ transform: `translateY(${columnStairTranslateY(index)})` }}
                      className="group relative flex w-full flex-col items-center will-change-transform"
                    >
                      <div className="flex w-full flex-col items-center">
                        <div className="transition-all duration-500 ease-out lg:group-hover:-translate-y-0.5 lg:group-hover:shadow-[0_12px_28px_-12px_rgba(234,179,8,0.22)]">
                          <div className={CARD_BOX}>
                            <div className="hide-scrollbar flex min-h-0 flex-1 flex-col items-center overflow-y-auto">
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

                        <div className="relative z-20 -mt-px flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-yellow-500 bg-[#111] text-[10px] font-bold text-yellow-400 shadow-sm transition-colors duration-300 group-hover:bg-yellow-500 group-hover:text-black lg:h-9 lg:w-9 lg:text-xs">
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
      </div>
    </section>
  );
}
