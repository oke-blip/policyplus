import { NextResponse } from "next/server";

import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch admin dashboard:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard data" },
      { status: 500 },
    );
  }
}
