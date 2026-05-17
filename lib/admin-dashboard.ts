import { prisma } from "@/lib/prisma";
import {
  parsePartners,
  parseTestimonials,
} from "@/lib/partners-testimonials";
import { getAllSettings } from "@/lib/settings";
import type {
  AdminDashboardData,
  AdminDashboardReview,
} from "@/lib/admin-dashboard-types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function thirtyDaysAgo(): Date {
  return new Date(Date.now() - THIRTY_DAYS_MS);
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const since = thirtyDaysAgo();

  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  const partners = parsePartners(settings.partners);
  const testimonials = parseTestimonials(settings.testimonials);

  const [
    totalPosts,
    recentPosts,
    totalEvents,
    recentEvents,
    upcomingEvents,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { createdAt: { gte: since } } }),
    prisma.event.count(),
    prisma.event.count({ where: { createdAt: { gte: since } } }),
    prisma.event.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, date: true, location: true },
    }),
  ]);

  const recentReviews: AdminDashboardReview[] = testimonials
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      name: item.author.trim() || "Anonymous",
      role: item.role,
      quote: item.quote,
    }));

  return {
    stats: [
      { label: "Total Articles", value: totalPosts, recentCount: recentPosts },
      { label: "Upcoming Events", value: totalEvents, recentCount: recentEvents },
      { label: "Total Partners", value: partners.length },
      { label: "Testimonials", value: testimonials.length },
    ],
    upcomingEvents: upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
    })),
    recentReviews,
  };
}
