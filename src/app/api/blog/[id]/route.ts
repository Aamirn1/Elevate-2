import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  slugify,
  ensureUniqueSlug,
  parseTags,
  calcReadingTime,
} from "@/lib/sanitize";

// NOTE: Next.js App Router does not allow two dynamic path segments
// ([id] and [slug]) at the same path level. We therefore merge them into
// one [id] route. The GET handler auto-detects whether the param is a
// numeric ID (admin lookup) or a slug (public lookup, increments views).

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}

// GET /api/blog/[id] OR /api/blog/[slug]
// - If param is numeric (id): return single post by id (admin). No view increment.
// - If param is non-numeric (slug): return single published post by slug.
//   Increment views by 1. Return 404 if not found or not published.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: param } = await params;
    const url = new URL(req.url);
    const admin = url.searchParams.get("admin") === "1";

    if (isNumericId(param)) {
      // admin lookup by id
      const post = await db.blogPost.findUnique({
        where: { id: parseInt(param, 10) },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });
      if (!post) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ ...post, tags: parseTags(post.tags) });
    }

    // public lookup by slug
    const post = await db.blogPost.findUnique({
      where: { slug: param },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!post || post.status !== "published") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (!admin) {
      const isLive = post.publishedAt === null || post.publishedAt <= new Date();
      if (!isLive) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    }

    // increment views (best-effort, non-blocking style but awaited for correctness)
    const updated = await db.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      tags: parseTags(updated.tags),
    });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[id] - update any fields of a post by id
// - If content changes, auto-recalc readingTime.
// - If status changes to published, set publishedAt if null.
// - Before updating content/title/excerpt, save a BlogRevision with OLD values
//   (editorName from request header x-editor or "admin").
// - If slug changes, ensure uniqueness.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: param } = await params;
    if (!isNumericId(param)) {
      return NextResponse.json(
        { error: "PUT requires a numeric id" },
        { status: 400 }
      );
    }
    const id = parseInt(param, 10);
    const body = await req.json();

    // fetch existing
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const editorName = req.headers.get("x-editor") || "admin";

    // Save a revision if title/content/excerpt is changing
    const titleChanged =
      body.title !== undefined && body.title !== existing.title;
    const contentChanged =
      body.content !== undefined && body.content !== existing.content;
    const excerptChanged =
      body.excerpt !== undefined && body.excerpt !== existing.excerpt;

    if (titleChanged || contentChanged || excerptChanged) {
      await db.blogRevision.create({
        data: {
          postId: existing.id,
          title: existing.title,
          content: existing.content,
          excerpt: existing.excerpt,
          editorName,
          revisionNote: body.revisionNote || "Auto-saved before edit",
        },
      });
    }

    // Build update data
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.excerpt !== undefined) data.excerpt = String(body.excerpt);
    if (body.content !== undefined) data.content = String(body.content);
    if (body.coverImage !== undefined) data.coverImage = String(body.coverImage);
    if (body.coverAlt !== undefined) data.coverAlt = String(body.coverAlt);
    if (body.author !== undefined) data.author = String(body.author);
    if (body.authorBio !== undefined) data.authorBio = String(body.authorBio);
    if (body.authorAvatar !== undefined) data.authorAvatar = String(body.authorAvatar);
    if (body.categoryId !== undefined) {
      data.categoryId =
        body.categoryId === null
          ? null
          : parseInt(body.categoryId, 10);
    }
    if (body.tags !== undefined) {
      const tagsArray = Array.isArray(body.tags)
        ? body.tags.filter((t: unknown) => typeof t === "string")
        : [];
      data.tags = JSON.stringify(tagsArray);
    }
    if (body.sortOrder !== undefined) {
      data.sortOrder =
        body.sortOrder === null ? null : parseInt(body.sortOrder, 10);
    }
    if (body.seoTitle !== undefined) data.seoTitle = String(body.seoTitle);
    if (body.seoDescription !== undefined) data.seoDescription = String(body.seoDescription);
    if (body.focusKeyword !== undefined) data.focusKeyword = String(body.focusKeyword);
    if (body.canonicalUrl !== undefined) data.canonicalUrl = String(body.canonicalUrl);
    if (body.ogTitle !== undefined) data.ogTitle = String(body.ogTitle);
    if (body.ogDescription !== undefined) data.ogDescription = String(body.ogDescription);
    if (body.ogImage !== undefined) data.ogImage = String(body.ogImage);
    if (body.twitterTitle !== undefined) data.twitterTitle = String(body.twitterTitle);
    if (body.twitterDescription !== undefined) data.twitterDescription = String(body.twitterDescription);
    if (body.twitterImage !== undefined) data.twitterImage = String(body.twitterImage);
    if (body.robotsMeta !== undefined) data.robotsMeta = String(body.robotsMeta);
    if (body.publishedAt !== undefined) {
      data.publishedAt = body.publishedAt === null ? null : new Date(body.publishedAt);
    }
    if (body.scheduledAt !== undefined) {
      data.scheduledAt = body.scheduledAt === null ? null : new Date(body.scheduledAt);
    }

    // slug handling: if provided, ensure uniqueness (skip self)
    if (body.slug !== undefined && body.slug !== existing.slug) {
      const baseSlug = slugify(String(body.slug));
      if (baseSlug && baseSlug !== existing.slug) {
        const newSlug = await ensureUniqueSlug(baseSlug, async (s) => {
          const found = await db.blogPost.findFirst({
            where: { slug: s, NOT: { id: existing.id } },
            select: { id: true },
          });
          return Boolean(found);
        });
        data.slug = newSlug;
      }
    }

    // status handling
    if (body.status !== undefined && body.status !== existing.status) {
      data.status = body.status;
      if (body.status === "published" && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    // recompute reading time if content changed
    if (contentChanged) {
      data.readingTime = calcReadingTime(String(body.content));
    }

    const updated = await db.blogPost.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      tags: parseTags(updated.tags),
    });
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[id]
// - If status !== trash, move to trash (set status=trash).
// - If status === trash, permanently delete (revisions cascade).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: param } = await params;
    if (!isNumericId(param)) {
      return NextResponse.json(
        { error: "DELETE requires a numeric id" },
        { status: 400 }
      );
    }
    const id = parseInt(param, 10);
    const existing = await db.blogPost.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existing.status === "trash") {
      await db.blogPost.delete({ where: { id } });
      return NextResponse.json({ success: true, permanentlyDeleted: true });
    }

    await db.blogPost.update({
      where: { id },
      data: { status: "trash" },
    });
    return NextResponse.json({ success: true, movedToTrash: true });
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
