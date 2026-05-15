"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Loader, Calendar, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HERO_NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function UpcomingEvents() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // If no events and not loading, don't show the section or show a message
  if (!loading && events.length === 0) return null;

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[55vh] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500/[0.06] blur-[110px]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 pb-4">
        <h2 className="w-full text-center text-3xl font-bold text-white sm:text-4xl mb-12">
          {t("events.header") || "Upcoming Events"}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-yellow-500" size={40} />
          </div>
        ) : (
          <div className="flex w-full gap-12 overflow-x-auto pb-24 snap-x snap-mandatory hide-scrollbar px-6 lg:px-12">
            {events.map((event, i) => (
              <article
                key={event.id || i}
                className="group relative flex flex-col md:flex-row h-auto md:h-[480px] w-[85vw] lg:w-[1000px] shrink-0 snap-center cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#08080a] transition-all duration-700 hover:border-yellow-500/30 shadow-2xl"
              >
                {/* Texture Overlay */}
                <div className="absolute inset-0 z-[1] opacity-[0.1] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("${HERO_NOISE_DATA_URI}")` }} />
                
                {/* Decorative Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 blur-3xl transition-opacity duration-1000 group-hover:opacity-100" />

                {/* Left Side: Visual Image */}
                <div className="relative h-60 md:h-full md:w-[45%] overflow-hidden bg-[#0a0a0a] shrink-0 border-r border-white/5">
                   <Image
                     src={event.image || "https://images.unsplash.com/photo-1514565131-fce080caee45?q=80&w=2000"}
                     alt=""
                     fill
                     className="object-cover opacity-80 transition-all duration-1000 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   
                   {/* Large Index Number */}
                   <span className="absolute top-8 left-8 text-6xl font-black text-white/10 italic select-none">
                      0{i + 1}
                   </span>
                </div>

                {/* Right Side: Balanced Content Section */}
                <div className="relative flex flex-1 flex-col justify-center p-10 md:p-12 lg:p-14 bg-[#08080a]">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-yellow-500 border border-yellow-500/20">{event.category || "Event"}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white md:text-3xl leading-tight tracking-tight lg:max-w-[90%]">
                        {event.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-3 group/item">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover/item:bg-yellow-500/10">
                           <Calendar className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">When</span>
                           <span className="text-sm text-gray-300 font-medium">{formatDate(event.date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 group/item">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover/item:bg-white/10">
                           <MapPin className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Where</span>
                           <span className="text-sm text-gray-300 font-medium">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <a
                        href={event.link || "#"}
                        className="group/btn relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-yellow-500 px-10 py-4 text-[10px] font-black text-black uppercase tracking-widest transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/5"
                      >
                        <span className="relative z-10">{t("events.detailButton") || "Join Event"}</span>
                        <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && events.length > 0 && (
          <button
            type="button"
            className="mx-auto mt-4 flex shrink-0 items-center gap-2 font-semibold text-white transition-colors hover:text-yellow-500"
          >
            {t("events.viewAll") || "View All"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
