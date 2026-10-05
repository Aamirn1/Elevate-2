import { NextRequest, NextResponse } from "next/server";
import { fetchBlogTags, createBlogTag } from "@/lib/data";

export async function GET() {
  try {
    const data = await fetchBlogTags();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load tags:", error);
    return NextResponse.json(
      { error: "Failed to load tags" },
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
    const data = await createBlogTag(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
