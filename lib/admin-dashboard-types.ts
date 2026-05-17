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

export type AdminDashboardSettingsSummary = {
  companyName: string;
  hasLogo: boolean;
  heroBannerCount: number;
  partnerCount: number;
  testimonialCount: number;
};

export type AdminDashboardData = {
  stats: AdminDashboardStat[];
  upcomingEvents: AdminDashboardEvent[];
  recentReviews: AdminDashboardReview[];
  settingsSummary: AdminDashboardSettingsSummary;
};

export const EMPTY_ADMIN_DASHBOARD: AdminDashboardData = {
  stats: [
    { label: "Publications", value: 0, recentCount: 0 },
    { label: "Events", value: 0, recentCount: 0 },
    { label: "Pending Applications", value: 0, recentCount: 0 },
    { label: "Active Job Postings", value: 0 },
  ],
  upcomingEvents: [],
  recentReviews: [],
  settingsSummary: {
    companyName: "",
    hasLogo: false,
    heroBannerCount: 0,
    partnerCount: 0,
    testimonialCount: 0,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function normalizeAdminDashboardData(
  value: unknown,
): AdminDashboardData {
  if (!isRecord(value)) return EMPTY_ADMIN_DASHBOARD;

  const stats = Array.isArray(value.stats)
    ? value.stats
        .filter(isRecord)
        .map((stat) => ({
          label: typeof stat.label === "string" ? stat.label : "—",
          value: typeof stat.value === "number" ? stat.value : 0,
          recentCount:
            typeof stat.recentCount === "number" ? stat.recentCount : undefined,
        }))
    : EMPTY_ADMIN_DASHBOARD.stats;

  const upcomingEvents = Array.isArray(value.upcomingEvents)
    ? value.upcomingEvents
        .filter(isRecord)
        .map((event) => ({
          id: typeof event.id === "string" ? event.id : String(event.id ?? ""),
          title: typeof event.title === "string" ? event.title : "Untitled",
          date: typeof event.date === "string" ? event.date : "—",
          location: typeof event.location === "string" ? event.location : "—",
        }))
    : [];

  const recentReviews = Array.isArray(value.recentReviews)
    ? value.recentReviews
        .filter(isRecord)
        .map((review) => ({
          id: review.id as string | number,
          name: typeof review.name === "string" ? review.name : "Anonymous",
          role: typeof review.role === "string" ? review.role : "",
          quote: typeof review.quote === "string" ? review.quote : "",
        }))
    : [];

  const settingsRaw = isRecord(value.settingsSummary)
    ? value.settingsSummary
    : null;

  const settingsSummary: AdminDashboardSettingsSummary = {
    companyName:
      typeof settingsRaw?.companyName === "string"
        ? settingsRaw.companyName
        : "",
    hasLogo: Boolean(settingsRaw?.hasLogo),
    heroBannerCount:
      typeof settingsRaw?.heroBannerCount === "number"
        ? settingsRaw.heroBannerCount
        : 0,
    partnerCount:
      typeof settingsRaw?.partnerCount === "number"
        ? settingsRaw.partnerCount
        : 0,
    testimonialCount:
      typeof settingsRaw?.testimonialCount === "number"
        ? settingsRaw.testimonialCount
        : 0,
  };

  return {
    stats: stats.length > 0 ? stats : EMPTY_ADMIN_DASHBOARD.stats,
    upcomingEvents,
    recentReviews,
    settingsSummary,
  };
}
