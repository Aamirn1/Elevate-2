import { NextRequest, NextResponse } from "next/server";
import { fetchBlogPostByIdOrSlug, updateBlogPost, deleteBlogPost } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const isAdmin = url.searchParams.get("admin") === "1";
    const isNumeric = /^\d+$/.test(id);
    const post = await fetchBlogPostByIdOrSlug(id, !isNumeric && !isAdmin);
    if (!post) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to load blog post:", error);
    return NextResponse.json(
      { error: "Failed to load blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await updateBlogPost(parseInt(id, 10), body);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteBlogPost(parseInt(id, 10));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
