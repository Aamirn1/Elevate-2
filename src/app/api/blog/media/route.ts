import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/blog/media - list all media sorted by createdAt DESC
export async function GET() {
  try {
    const media = await db.blogMedia.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error("Failed to fetch blog media:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog media" },
      { status: 500 }
    );
  }
}

// POST /api/blog/media - create media record (metadata only)
// Required: filename, url. Optional: mimeType, altText, title, caption, description,
// width, height, fileSize.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      filename,
      url,
      mimeType,
      altText,
      title,
      caption,
      description,
      width,
      height,
      fileSize,
    } = body;

    if (!filename || typeof filename !== "string" || !filename.trim()) {
      return NextResponse.json(
        { error: "Missing required field: filename" },
        { status: 400 }
      );
    }
    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { error: "Missing required field: url" },
        { status: 400 }
      );
    }

    const created = await db.blogMedia.create({
      data: {
        filename: String(filename).trim(),
        url: String(url).trim(),
        mimeType: mimeType || "",
        altText: altText || "",
        title: title || "",
        caption: caption || "",
        description: description || "",
        width:
          width !== undefined && width !== null ? parseInt(width, 10) : null,
        height:
          height !== undefined && height !== null ? parseInt(height, 10) : null,
        fileSize:
          fileSize !== undefined && fileSize !== null
            ? parseInt(fileSize, 10)
            : 0,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog media:", error);
    return NextResponse.json(
      { error: "Failed to create blog media" },
      { status: 500 }
    );
  }
}
