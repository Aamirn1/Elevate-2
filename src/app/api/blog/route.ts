import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  slugify,
  ensureUniqueSlug,
  parseTags,
  calcReadingTime,
} from "@/lib/sanitize";

// GET /api/blog - list blog posts with filters/pagination/sorting
// Query params:
//   status: "published" (default, public) | "all" (admin) | "draft"|"scheduled"|"archived"|"trash"
//   admin: "1" => return all statuses (admin)
//   category: <slug> filter by category slug
//   search: <text> substring match in title/excerpt/content
//   limit: number, default 50
//   offset: number, default 0
//   orderby: "createdAt"|"views"|"publishedAt" (default createdAt)
//   order: "desc"|"asc" (default desc)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;

    const admin = sp.get("admin") === "1";
    const statusParam = sp.get("status") || "published";
    const isAdminAll = admin || statusParam === "all";
    const categorySlug = sp.get("category") || "";
    const search = (sp.get("search") || "").trim();
    const limit = Math.min(
      200,
      Math.max(1, parseInt(sp.get("limit") || "50", 10) || 50)
    );
    const offset = Math.max(0, parseInt(sp.get("offset") || "0", 10) || 0);
    const orderby = (sp.get("orderby") || "createdAt") as
      | "createdAt"
      | "views"
      | "publishedAt";
    const order = (sp.get("order") || "desc") as "asc" | "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    const orClauses: Record<string, unknown>[] = [];

    if (isAdminAll) {
      if (statusParam !== "all") {
        where.status = statusParam;
      }
      // else: include all statuses
    } else {
      // public: status=published AND (publishedAt is null OR <= now)
      where.status = "published";
      orClauses.push(
        { publishedAt: null },
        { publishedAt: { lte: new Date() } }
      );
    }

    // category filter
    if (categorySlug) {
      const cat = await db.blogCategory.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (cat) {
        where.categoryId = cat.id;
      } else {
        // unknown category => no results
        return NextResponse.json({ items: [], total: 0 });
      }
    }

    // search filter (also OR clauses)
    if (search) {
      orClauses.push(
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } }
      );
    }

    if (orClauses.length > 0) {
      where.OR = orClauses;
    }

    const orderByClause =
      orderby === "publishedAt"
        ? [{ publishedAt: order }, { createdAt: order }]
        : { [orderby]: order };

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        // @ts-expect-error Prisma accepts array OR object for orderBy
        orderBy: orderByClause,
        skip: offset,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.blogPost.count({ where }),
    ]);

    const parsed = posts.map((p) => ({
      ...p,
      tags: parseTags(p.tags),
    }));

    return NextResponse.json({ items: parsed, total });
  } catch (error) {
    console.error("Failed to list blog posts:", error);
    return NextResponse.json(
      { error: "Failed to list blog posts" },
      { status: 500 }
    );
  }
}

// POST /api/blog - create a new blog post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug: providedSlug,
      excerpt,
      content,
      coverImage,
      coverAlt,
      author,
      authorBio,
      authorAvatar,
      categoryId,
      tags,
      status,
      sortOrder,
      seoTitle,
      seoDescription,
      focusKeyword,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      twitterTitle,
      twitterDescription,
      twitterImage,
      robotsMeta,
      publishedAt,
      scheduledAt,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Missing required field: title" },
        { status: 400 }
      );
    }

    // auto-generate unique slug
    const baseSlug = slugify(
      providedSlug && String(providedSlug).trim() ? String(providedSlug) : title
    );
    const finalSlug = await ensureUniqueSlug(baseSlug, async (s) => {
      const existing = await db.blogPost.findUnique({
        where: { slug: s },
        select: { id: true },
      });
      return Boolean(existing);
    });

    const finalContent = typeof content === "string" ? content : "";
    const finalExcerpt = typeof excerpt === "string" ? excerpt : "";
    const tagsArray = Array.isArray(tags)
      ? tags.filter((t: unknown) => typeof t === "string")
      : [];
    const finalStatus = status || "draft";

    const readingTime = calcReadingTime(finalContent);

    let finalPublishedAt: Date | null = null;
    if (finalStatus === "published") {
      finalPublishedAt =
        publishedAt !== undefined && publishedAt !== null
          ? new Date(publishedAt)
          : new Date();
    } else if (publishedAt) {
      finalPublishedAt = new Date(publishedAt);
    }

    const created = await db.blogPost.create({
      data: {
        title: String(title).trim(),
        slug: finalSlug,
        excerpt: finalExcerpt,
        content: finalContent,
        coverImage: coverImage || "",
        coverAlt: coverAlt || "",
        author: author || "ElevateEdge Digital",
        authorBio: authorBio || "",
        authorAvatar: authorAvatar || "",
        categoryId:
          categoryId !== undefined && categoryId !== null
            ? parseInt(categoryId, 10)
            : null,
        tags: JSON.stringify(tagsArray),
        status: finalStatus,
        sortOrder:
          sortOrder !== undefined && sortOrder !== null
            ? parseInt(sortOrder, 10)
            : null,
        readingTime,
        seoTitle: seoTitle || "",
        seoDescription: seoDescription || "",
        focusKeyword: focusKeyword || "",
        canonicalUrl: canonicalUrl || "",
        ogTitle: ogTitle || "",
        ogDescription: ogDescription || "",
        ogImage: ogImage || "",
        twitterTitle: twitterTitle || "",
        twitterDescription: twitterDescription || "",
        twitterImage: twitterImage || "",
        robotsMeta: robotsMeta || "index,follow",
        publishedAt: finalPublishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      { ...created, tags: parseTags(created.tags) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
