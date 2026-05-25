"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, CalendarDays, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { pickLocalized } from "@/lib/content-locale";
import { resolveListingPageHero } from "@/lib/public-listing-page-hero";
import { cn } from "@/lib/utils";

type EventFromApi = {
  id?: string;
  title: string;
  title_id?: string | null;
  location: string;
  location_id?: string | null;
  category?: string | null;
  category_id?: string | null;
  date: string;
  image?: string;
  link?: string;
};

function parseEventTimestamp(dateStr: string): number {
  const parsed = new Date(dateStr).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapEventForDisplay(event: EventFromApi, locale: "en" | "id") {
  return {
    ...event,
    displayTitle: pickLocalized(locale, event.title, event.title_id),
    displayLocation: pickLocalized(locale, event.location, event.location_id),
    displayCategory:
      pickLocalized(locale, event.category, event.category_id) || "Event",
    sortAt: parseEventTimestamp(event.date),
  };
}

const HERO_NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function UpcomingEvents({
  variant = "preview",
  data,
}: {
  /** `preview` = homepage with view-all affordance; `full` = dedicated events page */
  variant?: "preview" | "full";
  data?: Record<string, unknown>;
}) {
  const isFullPage = variant === "full";
  const { t, locale } = useLanguage();
  const [events, setEvents] = useState<EventFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [eventTab, setEventTab] = useState<"upcoming" | "past">("upcoming");
  const [activeCategory, setActiveCategory] = useState("all");
  const [referenceTimeMs, setReferenceTimeMs] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const pageHero = useMemo(
    () =>
      resolveListingPageHero("events", data, locale, {
        eyebrow: String(t("events.page.eyebrow")),
        title: String(t("events.page.title")),
        description: String(t("events.page.description")),
      }),
    [data, locale, t],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      try {
        setError(false);
        const res = await fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setEvents(data);
            setReferenceTimeMs(Date.now());
          }
        } else {
          if (!cancelled) setError(true);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const displayEvents = useMemo(
    () => events.map((event) => mapEventForDisplay(event, locale)),
    [events, locale],
  );

  const categories = useMemo(() => {
    const unique = new Set(displayEvents.map((e) => e.displayCategory).filter(Boolean));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [displayEvents]);

  const filteredEvents = useMemo(() => {
    if (!isFullPage) return displayEvents;
    let list = displayEvents.filter((event) => {
      const isUpcoming = event.sortAt >= referenceTimeMs || event.sortAt === 0;
      return eventTab === "upcoming" ? isUpcoming : !isUpcoming && event.sortAt > 0;
    });
    if (activeCategory !== "all") {
      list = list.filter((e) => e.displayCategory === activeCategory);
    }
    return list.sort((a, b) =>
      eventTab === "upcoming" ? a.sortAt - b.sortAt : b.sortAt - a.sortAt,
    );
  }, [displayEvents, isFullPage, eventTab, activeCategory, referenceTimeMs]);

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const joinLabel = String(t("events.page.joinCta"));
  const countLabel = String(t("events.page.countLabel")).replace(
    "{count}",
    String(filteredEvents.length),
  );

  // 2. Fungsi untuk mengontrol scroll ke Kiri dan Kanan
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Geser sejauh 80% dari lebar layar pengguna agar scroll-nya terasa pas per-kartu
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const eventsToRender = isFullPage ? filteredEvents : displayEvents;

  const renderEventCard = (
    event: ReturnType<typeof mapEventForDisplay>,
    index: number,
    layout: "preview" | "full",
  ) => (
    <article
      key={event.id || index}
      className={cn(
        "group relative flex overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#08080a] shadow-2xl transition-all duration-700 hover:border-yellow-500/30",
        layout === "full"
          ? "min-h-[320px] flex-col md:min-h-[360px] md:flex-row"
          : "h-auto w-[85vw] shrink-0 snap-center flex-col md:h-[480px] md:flex-row lg:w-[1000px]",
      )}
    >
      <div
        className="absolute inset-0 z-[1] opacity-[0.1] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("${HERO_NOISE_DATA_URI}")` }}
        aria-hidden
      />
      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 blur-3xl transition-opacity duration-1000 group-hover:opacity-100" aria-hidden />

      <div
        className={cn(
          "relative shrink-0 overflow-hidden border-white/5 bg-[#0a0a0a]",
          layout === "full"
            ? "h-56 w-full border-b md:h-auto md:w-[40%] md:border-b-0 md:border-r"
            : "h-60 w-full border-r md:h-full md:w-[45%]",
        )}
      >
        <Image
          src={event.image || "https://images.unsplash.com/photo-1514565131-fce080caee45?q=80&w=2000"}
          alt={event.displayTitle || "Event Image"}
          fill
          sizes={layout === "full" ? "(max-width: 768px) 100vw, 40vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          className="object-cover opacity-80 transition-all duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className="absolute top-8 left-8 text-6xl font-black text-white/10 italic select-none">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center bg-[#08080a] p-8 md:p-10 lg:p-12">
        <div className="z-10 space-y-5">
          <span className="inline-flex rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-500">
            {event.displayCategory}
          </span>
          <h3 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">
            {event.displayTitle}
          </h3>
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <Calendar className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">When</span>
                <span className="text-sm font-medium text-gray-300">{formatDate(event.date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Where</span>
                <span className="text-sm font-medium text-gray-300">{event.displayLocation}</span>
              </div>
            </div>
          </div>
          {eventTab !== "past" || !isFullPage ? (
            <div className="pt-4">
              <a
                href={event.link || "#"}
                className="group/btn relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-yellow-500 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-105 hover:bg-white active:scale-95"
              >
                <span className="relative z-10">{joinLabel}</span>
                <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );

  return (
    <section
      className={
        isFullPage
          ? "relative isolate w-full bg-black pt-28 pb-20 lg:pt-32 lg:pb-28"
          : "relative isolate flex min-h-svh w-full snap-start flex-col justify-center bg-black pt-28 pb-12 lg:pt-32 lg:pb-16"
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[55vh] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.06] blur-[110px]"
      />

      <div
        className={
          isFullPage
            ? "relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
            : "relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-4"
        }
      >
        {isFullPage ? (
          <PublicSectionHero
            eyebrow={pageHero.eyebrow}
            title={pageHero.title}
            description={pageHero.description}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-2">
                {(["upcoming", "past"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEventTab(tab)}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
                      eventTab === tab
                        ? "bg-yellow-500 text-black"
                        : "border border-white/10 bg-white/5 text-zinc-300 hover:border-yellow-500/30",
                    )}
                  >
                    {String(t(`events.page.tab${tab === "upcoming" ? "Upcoming" : "Past"}`))}
                  </button>
                ))}
              </div>
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                      activeCategory === "all"
                        ? "border border-yellow-500/40 bg-yellow-500/10 text-yellow-500"
                        : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white",
                    )}
                  >
                    {String(t("events.page.filterAll"))}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                        activeCategory === cat
                          ? "border border-yellow-500/40 bg-yellow-500/10 text-yellow-500"
                          : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              ) : null}
              {!loading && !error && events.length > 0 ? (
                <p className="text-sm font-medium text-zinc-500">{countLabel}</p>
              ) : null}
            </div>
          </PublicSectionHero>
        ) : (
          <h2 className="mb-12 w-full text-center text-3xl font-bold text-white sm:text-4xl">
            {t("events.header") || "Upcoming Events"}
          </h2>
        )}

        {loading ? (
          <div className="flex w-full gap-12 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar px-6 lg:px-12">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row h-auto md:h-[480px] w-[85vw] lg:w-[1000px] shrink-0 snap-center overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#08080a]"
              >
                <div className="h-60 md:h-full md:w-[45%] animate-pulse bg-white/5" />
                <div className="flex flex-1 flex-col justify-center p-10 md:p-12 lg:p-14 space-y-6">
                  <div className="h-5 w-20 animate-pulse rounded-full bg-white/5" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
                  <div className="h-20 w-3/4 animate-pulse rounded-xl bg-white/5" />
                  <div className="mt-4 h-12 w-40 animate-pulse rounded-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-12 rounded-[2.5rem] border border-white/5 bg-[#08080a] max-w-2xl mx-auto shadow-2xl mb-12">
            <AlertCircle className="text-rose-500/50 size-12 mb-5" />
            <p className="text-lg font-bold text-white mb-2">Failed to load events</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              We could not connect to our event database. Please check your internet connection or try again later.
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 rounded-[2.5rem] border border-white/5 bg-[#08080a] max-w-2xl mx-auto shadow-2xl mb-12">
            <CalendarDays className="text-yellow-500/30 size-12 mb-5" />
            <p className="text-lg font-bold text-white mb-2">No upcoming events</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              We do not have any scheduled events at the moment. Keep an eye on this space or subscribe to our newsletter for future updates!
            </p>
          </div>
        ) : isFullPage && eventsToRender.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-white/5 bg-[#08080a] p-12 text-center">
            <CalendarDays className="mb-4 size-12 text-yellow-500/30" />
            <p className="text-lg font-bold text-white">
              {eventTab === "upcoming" ? "No upcoming events" : "No past events"}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {eventTab === "upcoming"
                ? "Check back soon or try another category filter."
                : "Past sessions will appear here once archived."}
            </p>
          </div>
        ) : isFullPage ? (
          <div className="flex flex-col gap-8">
            {eventsToRender.map((event, i) => renderEventCard(event, i, "full"))}
          </div>
        ) : (
          <div className="group/slider relative w-full">
            {displayEvents.length > 1 && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all group-hover/slider:opacity-100 hover:scale-110 hover:bg-yellow-500 hover:text-black md:flex lg:left-4"
                aria-label="Scroll left"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              className="hide-scrollbar flex w-full snap-x snap-mandatory gap-12 overflow-x-auto scroll-smooth px-6 pb-16 lg:px-12"
            >
              {displayEvents.map((event, i) => renderEventCard(event, i, "preview"))}
            </div>

            {displayEvents.length > 1 && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all group-hover/slider:opacity-100 hover:scale-110 hover:bg-yellow-500 hover:text-black md:flex lg:right-4"
                aria-label="Scroll right"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        )}

        {/* Tombol View All (Hanya tampil kalau event > 0) */}
        {!isFullPage && !loading && !error && events.length > 0 && (
          <Link
            href="/events"
            className="mx-auto mt-4 flex shrink-0 items-center gap-2 font-semibold text-white transition-colors hover:text-yellow-500"
          >
            {t("events.viewAll") || "View All Events"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}