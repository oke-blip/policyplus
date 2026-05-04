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

/** Desktop: vertical connector height = (index + 1) × 3rem */
const CONNECTOR_HEIGHT_LG = [
  "h-[3rem]",
  "h-[6rem]",
  "h-[9rem]",
  "h-[12rem]",
  "h-[15rem]",
] as const;

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const desktopStepVars = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
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
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-500">
        <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
      </span>
      <h3
        className={cn(
          "mb-4 text-center text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-900",
          titleClassName
        )}
      >
        {step.title}
      </h3>
      <ul className="list-disc space-y-1.5 pl-4 text-left text-xs leading-relaxed text-gray-600 marker:text-yellow-500 dark:text-gray-600">
        {step.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </>
  );
}

export function MethodologySection() {
  const { t } = useLanguage();
  const steps = t<MethodologyStep[]>("methodology.steps");

  return (
    <section className="relative overflow-hidden bg-gray-50 py-32 dark:bg-neutral-950">
      {/* Ambient decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-yellow-500/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-[32rem] w-[32rem] rounded-full bg-gray-400/5 blur-3xl dark:bg-gray-500/10"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-1/4 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, 10, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 right-[8%] h-56 w-56 rounded-full bg-yellow-500/10 blur-3xl"
        animate={{ y: [0, 22, 0], x: [0, -14, 0], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-[1] mx-auto w-full min-w-0 max-w-7xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase dark:bg-gray-800">
            {t("methodology.tag")}
          </span>
          <h2 className="mt-6 break-words font-serif text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 hyphens-auto md:text-5xl lg:text-6xl dark:text-white">
            {t("methodology.header")}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {t("methodology.description")}
          </p>
        </header>

        {/* ——— Mobile: vertical timeline ——— */}
        <div className="relative mt-16 block lg:hidden">
          <div className="relative">
            <motion.div
              className="absolute bottom-0 left-6 top-0 w-0.5 origin-top bg-gradient-to-b from-yellow-500 to-gray-300 dark:to-gray-600"
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
                  className={cn("relative flex gap-6", index < steps.length - 1 ? "mb-12" : "")}
                >
                  <div className="pointer-events-none relative z-10 w-12 shrink-0">
                    <motion.div
                      className="absolute left-6 top-0 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-4 border-yellow-500 bg-white text-xs font-bold text-yellow-700 shadow-[0_0_15px_rgba(234,179,8,0.4)] dark:bg-gray-900 dark:text-yellow-400"
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
                    className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900"
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

        {/* ——— Desktop: horizontal 5-column staircase ——— */}
        <div className="relative mx-auto mt-24 hidden max-w-7xl px-4 lg:block">
          {/* Horizontal dashed baseline — draws L → R */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-5 left-4 right-4 z-0 border-t-2 border-dashed border-gray-400 dark:border-gray-600"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
          />

          <motion.div
            className="relative z-10 grid grid-cols-5 gap-6 lg:items-end"
            variants={containerVars}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? Settings;
              const connectorH =
                CONNECTOR_HEIGHT_LG[Math.min(index, CONNECTOR_HEIGHT_LG.length - 1)];

              return (
                <motion.div
                  key={`d-${step.id}-${step.title}`}
                  variants={desktopStepVars}
                  className="group relative flex w-full flex-col items-center"
                >
                  <div className="flex w-full flex-col items-center">
                    {/* 3D card + base */}
                    <div className="transition-all duration-500 ease-out group-hover:-translate-y-4 group-hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.3)]">
                      <div className="relative z-10 w-full overflow-hidden rounded-t-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-200 dark:bg-gray-50">
                        <div className="flex flex-col items-center">
                          <StepCardContent step={step} Icon={Icon} />
                        </div>
                      </div>
                      <div className="relative z-[5] -mt-2 h-12 w-full rounded-b-lg bg-gray-800 shadow-2xl dark:bg-black lg:h-16" />
                    </div>

                    {/* Vertical connector */}
                    <div
                      className={cn(
                        "w-0.5 shrink-0 border-l-2 border-dashed border-gray-400 dark:border-gray-600",
                        connectorH
                      )}
                      aria-hidden="true"
                    />

                    {/* Node on baseline */}
                    <div className="relative z-20 -mt-px flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-yellow-500 bg-white text-sm font-bold text-yellow-600 shadow-sm transition-colors duration-300 group-hover:bg-yellow-500 group-hover:text-white dark:bg-gray-900 dark:text-yellow-400 dark:group-hover:text-white">
                      {step.id}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
