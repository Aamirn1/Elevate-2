import { NextResponse } from "next/server";
import { fetchDashboardStats } from "@/lib/data";

export async function GET() {
  try {
    const stats = await fetchDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
