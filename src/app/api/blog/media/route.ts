import { NextRequest, NextResponse } from "next/server";
import { fetchBlogMedia, createBlogMedia } from "@/lib/data";

export async function GET() {
  try {
    const data = await fetchBlogMedia();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load media:", error);
    return NextResponse.json(
      { error: "Failed to load media" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.filename || !body.url) {
      return NextResponse.json(
        { error: "Filename and URL are required" },
        { status: 400 }
      );
    }
    const data = await createBlogMedia(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}
