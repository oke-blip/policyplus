import { prisma } from "@/lib/prisma";
import {
  parsePartners,
  parseTestimonials,
} from "@/lib/partners-testimonials";
import { getAllSettings } from "@/lib/settings";
import { parseHeroBanners } from "@/lib/settings-utils";
import type {
  AdminDashboardData,
  AdminDashboardReview,
} from "@/lib/admin-dashboard-types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function thirtyDaysAgo(): Date {
  return new Date(Date.now() - THIRTY_DAYS_MS);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
  const heroBanners = parseHeroBanners(settings.hero_banners);
  const companyName = readString(settings.company_name) || "Policy+";
  const hasLogo = readString(settings.company_logo).length > 0;

  const [
    totalPosts,
    recentPosts,
    totalEvents,
    recentEvents,
    pendingApplications,
    recentApplications,
    activeJobs,
    upcomingEvents,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { createdAt: { gte: since } } }),
    prisma.event.count(),
    prisma.event.count({ where: { createdAt: { gte: since } } }),
    prisma.jobApplication.count({ where: { status: "PENDING" } }),
    prisma.jobApplication.count({ where: { createdAt: { gte: since } } }),
    prisma.jobPosting.count({ where: { status: "ACTIVE" } }),
    prisma.event.findMany({
      take: 5,
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
      { label: "Publications", value: totalPosts, recentCount: recentPosts },
      { label: "Events", value: totalEvents, recentCount: recentEvents },
      {
        label: "Pending Applications",
        value: pendingApplications,
        recentCount: recentApplications,
      },
      { label: "Active Job Postings", value: activeJobs },
    ],
    upcomingEvents: upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
    })),
    recentReviews,
    settingsSummary: {
      companyName,
      hasLogo,
      heroBannerCount: heroBanners.length,
      partnerCount: partners.length,
      testimonialCount: testimonials.length,
    },
  };
}
