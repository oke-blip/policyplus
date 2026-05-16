"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { resolvePreloaderContent } from "@/lib/preloader-settings";

type Phase = "loading" | "quote" | "exit";

type PreloaderProps = {
  settings?: Record<string, unknown>;
};

function contentLocaleFromPathname(pathname: string | null): "en" | "id" {
  return pathname?.split("/")[1] === "id" ? "id" : "en";
}

function BrandMark({ name }: { name: string }) {
  const plusIndex = name.lastIndexOf("+");
  if (plusIndex > 0 && plusIndex === name.length - 1) {
    return (
      <>
        {name.slice(0, plusIndex)}
        <span className="text-yellow-500">+</span>
      </>
    );
  }
  return <>{name}</>;
}

export function Preloader({ settings: initialSettings }: PreloaderProps) {
  const [progress, setProgress] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [removed, setRemoved] = React.useState(false);
  const pathname = usePathname();
  const phaseRef = React.useRef<Phase>(phase);
  phaseRef.current = phase;

  const [source, setSource] = React.useState<Record<string, unknown>>(
    () => initialSettings ?? {},
  );

  React.useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSource(initialSettings);
    }
  }, [initialSettings]);

  React.useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) return;

    let cancelled = false;
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data === "object" && !Array.isArray(data)) {
          setSource(data as Record<string, unknown>);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [initialSettings]);

  const locale = contentLocaleFromPathname(pathname);
  const { companyName, quoteText, logoUrl } = React.useMemo(
    () => resolvePreloaderContent(source, locale),
    [source, locale],
  );

  React.useEffect(() => {
    let raf = 0;
    let scheduledQuote = false;
    const durationMs = 2000;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(p);

      if (p >= 100 && !scheduledQuote) {
        scheduledQuote = true;
        window.setTimeout(() => setPhase("quote"), 400);
        return;
      }

      if (p < 100) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  React.useEffect(() => {
    if (phase !== "quote") return;
    const t = window.setTimeout(() => setPhase("exit"), 1500);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (removed || (pathname && (pathname.includes("/admin") || pathname.includes("/login")))) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-gray-950 px-6 text-white"
      initial={false}
      animate={
        phase === "exit"
          ? { scale: 1.5, opacity: 0, filter: "blur(10px)" }
          : { scale: 1, opacity: 1, filter: "blur(0px)" }
      }
      transition={{ duration: 1, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (phaseRef.current === "exit") {
          setRemoved(true);
        }
      }}
    >
      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <motion.div
            key="loading"
            className="flex w-full max-w-md flex-col items-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-12 text-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="mx-auto h-16 w-auto max-w-xs object-contain sm:h-20"
                />
              ) : (
                <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  <BrandMark name={companyName} />
                </span>
              )}
            </div>

            <div className="relative h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                style={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 24 }}
              />
            </div>
            <p className="mt-4 font-medium tabular-nums tracking-wide text-white/70">{progress}%</p>
          </motion.div>
        ) : (
          <motion.p
            key="quote"
            className="max-w-2xl text-center font-sans text-2xl font-medium leading-snug text-white sm:text-3xl md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            {quoteText}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Preloader;
