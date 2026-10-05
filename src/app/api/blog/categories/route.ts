import { NextRequest, NextResponse } from "next/server";
import { fetchBlogCategories, createBlogCategory } from "@/lib/data";

export async function GET() {
  try {
    const data = await fetchBlogCategories();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load categories:", error);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    const data = await createBlogCategory(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
