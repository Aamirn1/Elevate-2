import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify, ensureUniqueSlug } from "@/lib/sanitize";

// PUT /api/blog/tags/[id] - update tag
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tagId = parseInt(id, 10);
    const body = await req.json();
    const { name, slug: providedSlug, description } = body;

    const existing = await db.blogTag.findUnique({
      where: { id: tagId },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name).trim();
    if (description !== undefined) data.description = String(description);

    let newSlug: string | undefined;
    if (providedSlug !== undefined && String(providedSlug).trim() !== "") {
      newSlug = slugify(String(providedSlug));
    } else if (name !== undefined) {
      newSlug = slugify(String(name));
    }
    if (newSlug && newSlug !== existing.slug) {
      data.slug = await ensureUniqueSlug(newSlug, async (s) => {
        const found = await db.blogTag.findFirst({
          where: { slug: s, NOT: { id: tagId } },
          select: { id: true },
        });
        return Boolean(found);
      });
    }

    const updated = await db.blogTag.update({ where: { id: tagId }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update blog tag:", error);
    return NextResponse.json(
      { error: "Failed to update blog tag" },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/tags/[id] - delete tag
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tagId = parseInt(id, 10);
    await db.blogTag.delete({ where: { id: tagId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog tag:", error);
    return NextResponse.json(
      { error: "Failed to delete blog tag" },
      { status: 500 }
    );
  }
}
