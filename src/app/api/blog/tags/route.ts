import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify, ensureUniqueSlug } from "@/lib/sanitize";

// GET /api/blog/tags - list all tags
export async function GET() {
  try {
    const tags = await db.blogTag.findMany({
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Failed to fetch blog tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog tags" },
      { status: 500 }
    );
  }
}

// POST /api/blog/tags - create tag. Required: name. Auto-generate slug.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const existing = await db.blogTag.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return Boolean(existing);
    });

    const created = await db.blogTag.create({
      data: {
        name: String(name).trim(),
        slug,
        description: description || "",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create blog tag:", error);
    return NextResponse.json(
      { error: "Failed to create blog tag" },
      { status: 500 }
    );
  }
}
