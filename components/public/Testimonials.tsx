"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { parseTestimonials } from "@/lib/partners-testimonials";
import { cn } from "@/lib/utils";

type TestimonialItem = {
  quote: string;
  author: string;
  role: string;
  image: string;
  quote_id?: string;
  role_id?: string;
};

const FALLBACK_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop",
];

function toDisplayItems(
  raw: ReturnType<typeof parseTestimonials>,
  isId: boolean,
): TestimonialItem[] {
  return raw
    .filter((item) => {
      const quote = isId && item.quote_id?.trim() ? item.quote_id : item.quote;
      return quote.trim();
    })
    .map((item, i) => {
      const quote =
        isId && item.quote_id?.trim() ? item.quote_id.trim() : item.quote.trim();
      const role =
        isId && item.role_id?.trim() ? item.role_id.trim() : item.role.trim();
      const author =
        isId && item.author_id?.trim()
          ? item.author_id.trim()
          : item.author.trim() || "Client";
      return {
        quote,
        author,
        role,
        image:
          item.image?.trim() ||
          FALLBACK_AVATARS[i % FALLBACK_AVATARS.length],
        quote_id: item.quote_id,
        role_id: item.role_id,
      };
    });
}

export function Testimonials({ data }: { data?: Record<string, unknown> }) {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isId = language === "ID";

  const items = toDisplayItems(parseTestimonials(data?.testimonials), isId);

  const fromCmsEn =
    typeof data?.testimonials_header === "string"
      ? data.testimonials_header.trim()
      : "";
  const fromCmsId =
    typeof data?.testimonials_header_id === "string"
      ? data.testimonials_header_id.trim()
      : "";
  const fromCms = isId && fromCmsId ? fromCmsId : fromCmsEn;
  const header =
    fromCms || t("testimonials.header") || "WHAT OUR CLIENTS SAY";

  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(false);

  const count = items.length;
  const safeActive = count ? Math.min(active, count - 1) : 0;

  const paginate = useCallback(
    (dir: number) => {
      if (!count) return;
      setActive((prev) => (prev + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (isHovered || !count) return;
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [isHovered, count, paginate]);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) =>
        setKeyboardNavEnabled(
          entry.isIntersecting && entry.intersectionRatio >= 0.3,
        ),
      { threshold: [0, 0.3, 0.5] },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!keyboardNavEnabled) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        paginate(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paginate, keyboardNavEnabled]);

  if (!count) return null;

  const current = items[safeActive];

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative isolate flex min-h-svh w-full snap-start flex-col justify-center overflow-hidden bg-black py-20 lg:py-24"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[50vh] w-[60vw] -translate-x-1/2 rounded-full bg-yellow-500/[0.04] blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 sm:px-6">
        <header className="mb-12 shrink-0 text-center lg:mb-16">
          <p className="text-xs font-semibold tracking-[0.32em] text-yellow-500 uppercase">
            {header}
          </p>
        </header>

        <div className="relative flex w-full flex-col items-center justify-center min-h-[280px] lg:min-h-[320px]">
          <Quote className="absolute -top-6 text-white/[0.03] size-32 md:size-48 lg:-top-10" />

          <AnimatePresence mode="wait">
            <motion.div
              key={safeActive}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <blockquote className="max-w-4xl text-xl font-light leading-relaxed text-white sm:text-2xl md:text-3xl lg:text-4xl lg:leading-snug">
                <span className="text-yellow-500/80 mr-1">&ldquo;</span>
                {current.quote}
                <span className="text-yellow-500/80 ml-1">&rdquo;</span>
              </blockquote>

              <div className="mt-8 md:mt-10">
                <p className="text-lg font-bold text-white">{current.author}</p>
                <p className="text-sm font-medium text-yellow-500/90 mt-1">
                  {current.role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 sm:gap-6 w-full">
          <button
            type="button"
            onClick={() => paginate(-1)}
            className="flex size-10 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto hide-scrollbar px-2 py-4">
            {items.map((item, index) => {
              const isActive = index === safeActive;
              return (
                <div key={`${item.author}-${index}`} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="testimonial-active-ring"
                      className="absolute -inset-2 rounded-full border-2 border-yellow-500"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    className={cn(
                      "relative block size-14 sm:size-16 shrink-0 overflow-hidden rounded-full border border-white/10 transition-all duration-300",
                      isActive
                        ? "scale-100 opacity-100 grayscale-0 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                        : "scale-90 opacity-40 grayscale hover:scale-95 hover:opacity-80 hover:grayscale-0",
                    )}
                  >
                    <Image
                      src={item.image}
                      alt={item.author}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => paginate(1)}
            className="flex size-10 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
