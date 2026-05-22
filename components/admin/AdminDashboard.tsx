"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  FileText, CalendarDays, HeartHandshake, MessageSquareQuote,
  ArrowUpRight, MapPin, Briefcase, UsersRound, Loader,
  BriefcaseBusiness, Inbox, Settings, AlertCircle, ChevronRight, LayoutDashboard
} from "lucide-react";

import {
  EMPTY_ADMIN_DASHBOARD,
  normalizeAdminDashboardData,
  type AdminDashboardData,
} from "@/lib/admin-dashboard-types";

// Ubah Ikon Stats
const statIcons = [FileText, CalendarDays, Inbox, BriefcaseBusiness] as const;

// Quick Links untuk Menu Cepat
const quickLinks = [
  { href: "/admin/publications", icon: FileText, title: "Publications", description: "Insights & knowledge articles" },
  { href: "/admin/events", icon: CalendarDays, title: "Events", description: "Conferences, webinars & sessions" },
  { href: "/admin/jobs", icon: BriefcaseBusiness, title: "Jobs & Applications", description: "Postings and candidate pipeline" },
  { href: "/admin/partners", icon: HeartHandshake, title: "Partners & Reviews", description: "Logos and testimonials" },
  { href: "/admin/teams", icon: UsersRound, title: "Manage Teams", description: "About page roster & portraits" },
  { href: "/admin/settings", icon: Settings, title: "Setting Compro", description: "Company profile & homepage CMS" },
] as const;

type AdminDashboardProps = {
  data?: AdminDashboardData;
};

export function AdminDashboard({ data: initialData }: AdminDashboardProps) {
  const [data, setData] = useState<AdminDashboardData>(() => initialData ?? EMPTY_ADMIN_DASHBOARD);
  const [loading, setLoading] = useState(!initialData);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "include" });
        const json: unknown = await res.json();
        if (!res.ok) throw new Error("Dashboard fetch failed");
        if (!cancelled) {
          setData(normalizeAdminDashboardData(json));
          setFetchError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setData(EMPTY_ADMIN_DASHBOARD);
          setFetchError(error instanceof Error ? error.message : "Could not load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [initialData]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const { settingsSummary } = data;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 pb-20 relative">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-yellow-500/[0.03] blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <LayoutDashboard size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Command Center</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Overview</h1>
          <p className="mt-1 text-gray-500 dark:text-slate-400">{settingsSummary.companyName || "Policy+"} — Site content at a glance.</p>
        </div>
      </motion.div>

      {/* Error State */}
      {fetchError && (
        <motion.div variants={itemVariants} className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-bold text-rose-600 dark:text-rose-400">
          <AlertCircle size={18} /> {fetchError}
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader className="size-10 animate-spin text-gray-300 dark:text-white/20" />
        </div>
      ) : (
        <div className="space-y-10 relative z-10">
          
          {/* STATS WIDGETS */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.stats.map((stat, idx) => {
              const Icon = statIcons[idx] ?? FileText;
              const showRecent = stat.recentCount !== undefined && stat.recentCount > 0;

              return (
                <motion.div key={stat.label} variants={itemVariants} className="group relative rounded-[2rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0c] p-8 transition-all duration-300 hover:border-yellow-500/30 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-2xl dark:hover:shadow-yellow-500/5">
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/10 text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-500/10 transition-colors duration-300">
                      <Icon size={24} strokeWidth={2} />
                    </div>
                    {showRecent && (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowUpRight size={14} strokeWidth={3} />+{stat.recentCount}
                      </div>
                    )}
                  </div>
                  <div className="relative z-10 mt-8">
                    <h3 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                      {stat.value}
                    </h3>
                    <p className="mt-2 text-sm font-bold uppercase tracking-widest text-gray-500">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* QUICK LINKS & SETTINGS SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Quick Links */}
            <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0c] p-5 shadow-sm dark:shadow-none transition-all hover:border-yellow-500/30 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/10 text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-500/10 transition-colors">
                    <link.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">
                      {link.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 dark:text-gray-600 group-hover:text-yellow-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </motion.div>

            {/* Settings Summary Card */}
            <motion.div variants={itemVariants} className="rounded-[2rem] border border-gray-200 dark:border-white/5 bg-gradient-to-br from-white to-gray-50 dark:from-[#111] dark:to-[#0a0a0c] p-8 flex flex-col justify-between shadow-sm dark:shadow-xl">
              <div>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Company Settings</h2>
                    <p className="text-xs text-gray-500 mt-1">CMS Configuration Status</p>
                  </div>
                  <Settings size={20} className="text-gray-400 dark:text-gray-600" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Logo</span>
                    <span className={`text-sm font-bold ${settingsSummary.hasLogo ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {settingsSummary.hasLogo ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Hero Banners</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{settingsSummary.heroBannerCount} Active</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Social Proof</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{settingsSummary.partnerCount} Logos / {settingsSummary.testimonialCount} Reviews</span>
                  </div>
                </div>
              </div>
              <Link href="/admin/settings" className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white font-bold text-sm rounded-xl transition-colors">
                Edit Settings
              </Link>
            </motion.div>
          </div>

          {/* RECENT EVENTS & REVIEWS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Events */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0c] p-8 shadow-sm">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Recent Events</h2>
                  <p className="mt-1 text-sm text-gray-500">Latest scheduled activities</p>
                </div>
                <CalendarDays size={24} className="text-gray-300 dark:text-white/10" />
              </div>
              <div className="flex-1 space-y-3">
                {data.upcomingEvents.length === 0 ? (
                  <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                    <p className="text-sm font-bold">No events scheduled.</p>
                  </div>
                ) : (
                  data.upcomingEvents.map((event) => (
                    <div key={event.id} className="group flex items-center justify-between rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] p-5 transition-all hover:border-yellow-500/30">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">{event.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-gray-400 dark:text-gray-600"/>{event.date}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400 dark:text-gray-600"/>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div variants={itemVariants} className="flex flex-col rounded-[2.5rem] border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0c] p-8 shadow-sm">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Recent Reviews</h2>
                  <p className="mt-1 text-sm text-gray-500">Latest partner testimonials</p>
                </div>
                <MessageSquareQuote size={24} className="text-gray-300 dark:text-white/10" />
              </div>
              <div className="flex-1 space-y-3">
                {data.recentReviews.length === 0 ? (
                  <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                    <p className="text-sm font-bold">No testimonials yet.</p>
                  </div>
                ) : (
                  data.recentReviews.map((review) => (
                    <div key={review.id} className="group rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] p-5 transition-all hover:border-yellow-500/30">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 dark:text-white">{review.name}</p>
                        {review.role && <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-500/80 bg-yellow-100 dark:bg-yellow-500/10 px-3 py-1 rounded-full">{review.role}</span>}
                      </div>
                      {review.quote && <p className="text-sm italic text-gray-600 dark:text-gray-400 line-clamp-2">&ldquo;{review.quote}&rdquo;</p>}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

        </div>
      )}
    </motion.div>
  );
}