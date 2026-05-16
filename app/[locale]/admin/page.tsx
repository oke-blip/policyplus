import { AdminDashboard } from "@/components/admin/AdminDashboard";
import {
  getAdminDashboardData,
  type AdminDashboardData,
} from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

const emptyDashboard: AdminDashboardData = {
  stats: [
    { label: "Total Articles", value: 0, recentCount: 0 },
    { label: "Upcoming Events", value: 0, recentCount: 0 },
    { label: "Total Partners", value: 0 },
    { label: "Testimonials", value: 0 },
  ],
  upcomingEvents: [],
  recentReviews: [],
};

export default async function AdminDashboardPage() {
  let data: AdminDashboardData = emptyDashboard;

  try {
    data = await getAdminDashboardData();
  } catch {
    // Empty DB or connection errors — show zeros
  }

  return <AdminDashboard data={data} />;
}
