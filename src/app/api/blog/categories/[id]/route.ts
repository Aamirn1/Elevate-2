import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify, ensureUniqueSlug } from "@/lib/sanitize";

// PUT /api/blog/categories/[id] - update category
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    const body = await req.json();
    const { name, slug: providedSlug, description, image, parentId, sortOrder } =
      body;

    const existing = await db.blogCategory.findUnique({
      where: { id: catId },
      select: { id: true, slug: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name).trim();
    if (description !== undefined) data.description = String(description);
    if (image !== undefined) data.image = String(image);
    if (parentId !== undefined) {
      data.parentId =
        parentId === null ? null : parseInt(parentId, 10);
    }
    if (sortOrder !== undefined) {
      data.sortOrder = sortOrder === null ? null : parseInt(sortOrder, 10);
    }

    // slug: regenerate if name changes & slug not provided, or use provided slug
    let newSlug: string | undefined;
    if (providedSlug !== undefined && String(providedSlug).trim() !== "") {
      newSlug = slugify(String(providedSlug));
    } else if (name !== undefined) {
      newSlug = slugify(String(name));
    }
    if (newSlug && newSlug !== existing.slug) {
      data.slug = await ensureUniqueSlug(newSlug, async (s) => {
        const found = await db.blogCategory.findFirst({
          where: { slug: s, NOT: { id: catId } },
          select: { id: true },
        });
        return Boolean(found);
      });
    }

    const updated = await db.blogCategory.update({
      where: { id: catId },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update blog category:", error);
    return NextResponse.json(
      { error: "Failed to update blog category" },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/categories/[id] - delete category; posts.categoryId set to null
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    await db.blogCategory.delete({ where: { id: catId } });
    // Posts referencing this category already get categoryId=nullified via
    // the onDelete: SetNull relation in the Prisma schema.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete blog category:", error);
    return NextResponse.json(
      { error: "Failed to delete blog category" },
      { status: 500 }
    );
  }
}
