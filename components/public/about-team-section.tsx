"use client";

import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

export type AboutTeamMember = {
  name: string;
  role: string;
  focus: string;
};

type AboutTeamSectionProps = {
  eyebrow: string;
  heading: string;
  sub: string;
  joinCta: string;
  keyboardHint: string;
  touchHint: string;
  members: AboutTeamMember[];
};

/** Curated portrait plates — editorial, consistent lighting, Unsplash-sourced. */
const PORTRAIT_BY_INDEX: readonly string[] = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=960&q=80",
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function AboutTeamSection({
  eyebrow,
  heading,
  sub,
  joinCta,
  keyboardHint,
  touchHint,
  members,
}: AboutTeamSectionProps) {
  const groupId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 180, damping: 22, mass: 0.4 });
  const sheen = useMotionTemplate`radial-gradient(650px circle at ${sx}% ${sy}%, rgba(234,179,8,0.14), transparent 55%)`;

  const count = members.length;
  const safeIndex = clamp(active, 0, Math.max(0, count - 1));
  const current = members[safeIndex];

  const go = useCallback(
    (dir: -1 | 1) => {
      if (!count) return;
      setActive((i) => clamp(i + dir, 0, count - 1));
    },
    [count],
  );

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setKeyboardNavEnabled(entry.isIntersecting && entry.intersectionRatio >= 0.2);
      },
      { threshold: [0, 0.2, 0.35, 0.5] },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!keyboardNavEnabled) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("input,textarea,select") || target.closest('[contenteditable="true"]'))
      ) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, keyboardNavEnabled]);

  const onSpotlightMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = spotlightRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100));
    my.set(clamp(((e.clientY - r.top) / r.height) * 100, 0, 100));
  };

  const onSpotlightLeave = () => {
    mx.set(50);
    my.set(38);
  };

  if (!count || !current) return null;

  return (
    <section
      ref={sectionRef}
      id="meet-the-team"
      className="relative min-h-svh w-full shrink-0 snap-start bg-black"
      aria-labelledby={`${groupId}-team-heading`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[20%] top-[18%] h-[min(70vh,28rem)] w-[min(90vw,34rem)] rounded-full bg-yellow-500/[0.07] blur-[120px] motion-safe:animate-about-team-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-12%] h-[min(55vh,22rem)] w-[min(80vw,28rem)] rounded-full bg-white/[0.04] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 px-4 pb-16 pt-28 sm:px-6 lg:pb-20 lg:pt-32">
          <header className="mx-auto max-w-7xl text-center lg:text-left">
            <p className="text-xs font-semibold tracking-[0.32em] text-yellow-500 uppercase">{eyebrow}</p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h2
                id={`${groupId}-team-heading`}
                className="text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl"
              >
                {heading}
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-gray-400 lg:max-w-md lg:pb-1 lg:text-right lg:text-base">
                {sub}
              </p>
            </div>
          </header>

          <div className="mx-auto mt-10 grid max-w-7xl gap-8 lg:mt-12 lg:grid-cols-12 lg:items-stretch lg:gap-10">
            {/* Spotlight */}
            <div className="relative lg:col-span-7">
              <motion.div
                ref={spotlightRef}
                onMouseMove={onSpotlightMove}
                onMouseLeave={onSpotlightLeave}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[min(72vh,520px)]"
                style={{ perspective: 1200 }}
              >
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
                  style={{ background: sheen }}
                />
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/90 sm:via-black/25 sm:to-transparent" />

                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={current.name}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={PORTRAIT_BY_INDEX[safeIndex % PORTRAIT_BY_INDEX.length]!}
                      alt=""
                      fill
                      draggable={false}
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      priority={safeIndex === 0}
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="relative z-30 flex h-full flex-col justify-end p-6 sm:p-8 lg:max-w-[85%] lg:p-10">
                  <motion.div
                    key={`meta-${current.name}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-[11px] font-semibold tracking-[0.28em] text-yellow-400/90 uppercase">
                      {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                      {current.name}
                    </p>
                    <p className="mt-1 text-sm font-medium text-yellow-400/95 sm:text-base">{current.role}</p>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-gray-300 sm:text-base">{current.focus}</p>
                  </motion.div>
                </div>

                {/* Mobile / tablet controls */}
                <div className="absolute right-4 bottom-4 z-40 flex flex-col items-end gap-2 lg:hidden">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      disabled={safeIndex === 0}
                      className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition enabled:hover:border-yellow-500/50 enabled:hover:text-yellow-300 disabled:opacity-35"
                      aria-label="Previous team member"
                    >
                      <ChevronLeft className="size-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      disabled={safeIndex === count - 1}
                      className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition enabled:hover:border-yellow-500/50 enabled:hover:text-yellow-300 disabled:opacity-35"
                      aria-label="Next team member"
                    >
                      <ChevronRight className="size-5" aria-hidden />
                    </button>
                  </div>
                  <p className="max-w-[14rem] rounded-xl border border-white/10 bg-black/55 px-3 py-2 text-right text-[10px] leading-snug text-gray-300 backdrop-blur-md">
                    {touchHint}
                  </p>
                </div>
              </motion.div>

              <p className="mt-3 hidden text-center text-xs text-gray-500 lg:block">{keyboardHint}</p>
            </div>

            {/* Roster */}
            <div className="flex flex-col justify-center lg:col-span-5">
              <div
                className="flex flex-col gap-2.5"
                role="radiogroup"
                aria-label={heading}
              >
                {members.map((member, index) => {
                  const isActive = index === safeIndex;
                  return (
                    <motion.button
                      key={member.name}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setActive(index)}
                      whileTap={{ scale: 0.985 }}
                      className={`relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border px-4 py-4 text-left transition-colors duration-300 sm:px-5 sm:py-5 ${
                        isActive
                          ? "border-yellow-500/45 bg-white/[0.06] shadow-[0_0_0_1px_rgba(234,179,8,0.12),0_18px_50px_rgba(0,0,0,0.45)]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex min-w-[2.25rem] items-center justify-center rounded-lg border px-2 py-1 text-[11px] font-bold tabular-nums tracking-wide uppercase ${
                          isActive
                            ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-300"
                            : "border-white/10 bg-black/30 text-gray-500"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-semibold text-white sm:text-lg">
                          {member.name}
                        </span>
                        <span className="mt-0.5 block text-sm text-gray-400">{member.role}</span>
                      </span>
                      <ArrowUpRight
                        className={`mt-1 size-5 shrink-0 transition-transform duration-300 ${
                          isActive ? "translate-x-0.5 -translate-y-0.5 text-yellow-400" : "text-gray-600"
                        }`}
                        aria-hidden
                      />
                      {isActive ? (
                        <motion.span
                          layoutId="team-active-bar"
                          className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-600"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        />
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-6">
                <Link
                  href="/career"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-400 sm:w-auto"
                >
                  {joinCta}
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
      </div>

    </section>
  );
}
