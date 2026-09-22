import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT /api/blog/media/[id] - update media metadata
// (altText, title, caption, description)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);
    const body = await req.json();
    const { altText, title, caption, description } = body;

    const data: Record<string, unknown> = {};
    if (altText !== undefined) data.altText = String(altText);
    if (title !== undefined) data.title = String(title);
    if (caption !== undefined) data.caption = String(caption);
    if (description !== undefined) data.description = String(description);

    const updated = await db.blogMedia.update({
      where: { id: mediaId },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update blog media:", error);
    return NextResponse.json(
      { error: "Failed to update blog media" },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/media/[id] - remove media record
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mediaId = parseInt(id, 10);
    await db.blogMedia.delete({ where: { id: mediaId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog media:", error);
    return NextResponse.json(
      { error: "Failed to delete blog media" },
      { status: 500 }
    );
  }
}
