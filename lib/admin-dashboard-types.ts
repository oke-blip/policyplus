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

export const EMPTY_ADMIN_DASHBOARD: AdminDashboardData = {
  stats: [
    { label: "Total Articles", value: 0, recentCount: 0 },
    { label: "Upcoming Events", value: 0, recentCount: 0 },
    { label: "Total Partners", value: 0 },
    { label: "Testimonials", value: 0 },
  ],
  upcomingEvents: [],
  recentReviews: [],
};
