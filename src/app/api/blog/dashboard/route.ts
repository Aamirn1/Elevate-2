import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/blog/dashboard - return dashboard stats
export async function GET() {
  try {
    const [
      totalArticles,
      published,
      draft,
      scheduled,
      archived,
      trash,
      viewsAgg,
      categories,
      tagsCount,
    ] = await Promise.all([
      db.blogPost.count({ where: { status: { not: "trash" } } }),
      db.blogPost.count({ where: { status: "published" } }),
      db.blogPost.count({ where: { status: "draft" } }),
      db.blogPost.count({ where: { status: "scheduled" } }),
      db.blogPost.count({ where: { status: "archived" } }),
      db.blogPost.count({ where: { status: "trash" } }),
      db.blogPost.aggregate({ _sum: { views: true } }),
      db.blogCategory.count(),
      db.blogTag.count(),
    ]);

    return NextResponse.json({
      totalArticles,
      published,
      draft,
      scheduled,
      archived,
      trash,
      totalViews: viewsAgg._sum.views || 0,
      categories,
      tags: tagsCount,
    });
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats" },
      { status: 500 }
    );
  }
}
