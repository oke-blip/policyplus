"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  FileText,
  CalendarDays,
  HeartHandshake,
  MessageSquareQuote,
  ArrowUpRight,
  MapPin,
  Briefcase,
  UsersRound,
} from "lucide-react";

import type { AdminDashboardData } from "@/lib/admin-dashboard";

const statIcons = [FileText, CalendarDays, HeartHandshake, MessageSquareQuote] as const;

const statGradients = [
  "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10",
  "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10",
  "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10",
  "from-slate-700 to-slate-900 dark:from-white/20 dark:to-white/10",
] as const;

const statShadows = [
  "shadow-slate-500/20",
  "shadow-slate-500/20",
  "shadow-slate-500/20",
  "shadow-slate-500/20",
] as const;

type AdminDashboardProps = {
  data: AdminDashboardData;
};

export function AdminDashboard({ data }: AdminDashboardProps) {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "en";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div
        variants={itemVariants}
        className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
            <Briefcase size={16} />
            <span>Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Overview
          </h1>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat, idx) => {
          const Icon = statIcons[idx] ?? FileText;
          const gradient = statGradients[idx] ?? statGradients[0];
          const shadow = statShadows[idx] ?? statShadows[0];
          const showRecent =
            stat.recentCount !== undefined && stat.recentCount > 0;

          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group relative rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:border-white/5 dark:bg-white/[0.02]"
            >
              <motion.div
                variants={itemVariants}
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-5`}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>
                {showRecent ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                    <ArrowUpRight size={14} strokeWidth={3} />+{stat.recentCount}
                  </div>
                ) : null}
              </div>
              <motion.div variants={itemVariants} className="relative z-10 mt-6">
                <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {stat.value}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Link
          href={`/${currentLocale}/admin/teams`}
          className="group flex items-center gap-4 rounded-2xl border border-slate-200/50 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-white/5 dark:bg-white/[0.02]"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900">
            <UsersRound size={22} />
          </div>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-200">
              Manage Teams
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              About page roster & portraits
            </p>
          </div>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          variants={itemVariants}
          className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-white/[0.02]"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Upcoming Events
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Next scheduled activities
            </p>
          </div>

          <div className="flex-1 space-y-4">
            {data.upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No events yet.
              </p>
            ) : (
              data.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200/50 bg-white/50 p-4 shadow-sm transition-all hover:shadow-md dark:border-white/5 dark:bg-white/5"
                >
                  <div>
                    <p className="font-bold text-slate-900 transition-colors group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300">
                      {event.title}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-white/[0.02]"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recent Reviews
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest partner testimonials
            </p>
          </div>

          <div className="flex-1 space-y-4">
            {data.recentReviews.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No testimonials yet.
              </p>
            ) : (
              data.recentReviews.map((review) => (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  className="group rounded-2xl border border-slate-200/50 bg-white/50 p-4 shadow-sm transition-all hover:shadow-md dark:border-white/5 dark:bg-white/5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {review.name}
                    </p>
                    {review.role ? (
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {review.role}
                      </p>
                    ) : null}
                  </div>
                  {review.quote ? (
                    <p className="text-sm italic text-slate-600 dark:text-slate-400">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                  ) : null}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
