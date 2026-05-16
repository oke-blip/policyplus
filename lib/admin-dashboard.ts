import { prisma } from "@/lib/prisma";
import { getAllSettings } from "@/lib/settings";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function thirtyDaysAgo(): Date {
  return new Date(Date.now() - THIRTY_DAYS_MS);
}

export type AdminDashboardStat = {
  label: string;
  value: number;
  recentCount?: number;
};

export type AdminDashboardEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
};

export type AdminDashboardReview = {
  id: string | number;
  name: string;
  role: string;
  quote: string;
};

export type AdminDashboardData = {
  stats: AdminDashboardStat[];
  upcomingEvents: AdminDashboardEvent[];
  recentReviews: AdminDashboardReview[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const since = thirtyDaysAgo();

  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  const partners = Array.isArray(settings.partners) ? settings.partners : [];
  const testimonials = Array.isArray(settings.testimonials)
    ? settings.testimonials
    : [];

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
    .map((item, index) => {
      const t = item as Record<string, unknown>;
      return {
        id: (t.id as string | number) ?? index,
        name: typeof t.author === "string" ? t.author : "Anonymous",
        role: typeof t.role === "string" ? t.role : "",
        quote: typeof t.quote === "string" ? t.quote : "",
      };
    });

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
