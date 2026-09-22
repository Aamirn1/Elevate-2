import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify, ensureUniqueSlug } from "@/lib/sanitize";

// GET /api/blog/categories - list all categories sorted by sortOrder, include postCount
export async function GET() {
  try {
    const cats = await db.blogCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { posts: true } },
      },
    });
    const result = cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      createdAt: c.createdAt,
      postCount: c._count.posts,
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch blog categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog categories" },
      { status: 500 }
    );
  }
}

// POST /api/blog/categories - create category
// Required: name. Auto-generate slug. Optional: description, image, parentId, sortOrder.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, image, parentId, sortOrder } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const existing = await db.blogCategory.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return Boolean(existing);
    });

    const created = await db.blogCategory.create({
      data: {
        name: String(name).trim(),
        slug,
        description: description || "",
        image: image || "",
        parentId:
          parentId !== undefined && parentId !== null
            ? parseInt(parentId, 10)
            : null,
        sortOrder:
          sortOrder !== undefined && sortOrder !== null
            ? parseInt(sortOrder, 10)
            : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog category:", error);
    return NextResponse.json(
      { error: "Failed to create blog category" },
      { status: 500 }
    );
  }
}
