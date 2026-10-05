import { NextRequest, NextResponse } from "next/server";
import { fetchBlogPosts, createBlogPost } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "published";
    const category = url.searchParams.get("category") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const orderby = url.searchParams.get("orderby") || "createdAt";
    const order = url.searchParams.get("order") || "desc";
    const admin = url.searchParams.get("admin") || url.searchParams.get("status") === "all";

    const data = await fetchBlogPosts({
      status: admin ? "all" : status,
      category,
      search,
      limit,
      offset,
      orderby,
      order,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load blog posts:", error);
    return NextResponse.json(
      { error: "Failed to load blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    const data = await createBlogPost(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
