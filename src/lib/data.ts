/**
 * Supabase client for API route handlers.
 * Tries Supabase first; falls back to Prisma if Supabase is unavailable.
 */

import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export { db as prisma };

// ─── Type mappings: Supabase snake_case → API camelCase ───────────

export function mapTestimonial(t: any) {
  return {
    id: t.id,
    name: t.name,
    role: t.role ?? "",
    avatar: t.avatar ?? "",
    rating: t.rating ?? 5,
    quote: t.quote,
    company: t.company ?? "",
    companyUrl: t.company_url ?? "",
    sortOrder: t.sort_order ?? 0,
    featured: t.featured ?? false,
    published: t.published ?? true,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

export function mapBlogPost(p: any) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    coverImage: p.cover_image ?? "",
    coverAlt: p.cover_alt ?? "",
    author: p.author ?? "ElevateEdge Digital",
    authorBio: p.author_bio ?? "",
    authorAvatar: p.author_avatar ?? "",
    categoryId: p.category_id ?? null,
    category: null as any,
    tags:
      typeof p.tags === "string"
        ? JSON.parse(p.tags || "[]")
        : p.tags || [],
    status: p.status ?? "draft",
    sortOrder: p.sort_order ?? null,
    views: p.views ?? 0,
    readingTime: p.reading_time ?? 0,
    seoTitle: p.seo_title ?? "",
    seoDescription: p.seo_description ?? "",
    focusKeyword: p.focus_keyword ?? "",
    canonicalUrl: p.canonical_url ?? "",
    ogTitle: p.og_title ?? "",
    ogDescription: p.og_description ?? "",
    ogImage: p.og_image ?? "",
    twitterTitle: p.twitter_title ?? "",
    twitterDescription: p.twitter_description ?? "",
    twitterImage: p.twitter_image ?? "",
    robotsMeta: p.robots_meta ?? "index,follow",
    publishedAt: p.published_at,
    scheduledAt: p.scheduled_at,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// ─── Testimonial data access ───────────────────────────────────────

export async function fetchTestimonials() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) {
        return data.map(mapTestimonial);
      }
    } catch {
      // fall through to prisma
    }
  }
  // Prisma fallback
  const items = await db.testimonial.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return items.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    avatar: t.avatar,
    rating: t.rating,
    quote: t.quote,
    company: t.company,
    companyUrl: t.companyUrl,
    sortOrder: t.sortOrder,
    featured: t.featured,
    published: t.published,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
}

export async function createTestimonial(data: any) {
  if (supabase) {
    try {
      const insert = {
        name: data.name,
        role: data.role ?? "",
        avatar: data.avatar ?? "",
        rating: clamp(data.rating ?? 5, 1, 5),
        quote: data.quote,
        company: data.company ?? "",
        company_url: data.companyUrl ?? "",
        sort_order: data.sortOrder ?? 0,
        featured: data.featured ?? false,
        published: data.published ?? true,
      };
      const { data: row, error } = await supabase
        .from("testimonials")
        .insert(insert)
        .select()
        .single();
      if (!error && row) return mapTestimonial(row);
    } catch {
      // fall through
    }
  }
  const t = await db.testimonial.create({ data });
  return t;
}

export async function updateTestimonial(id: number, data: any) {
  if (supabase) {
    try {
      const update: any = {};
      if (data.name !== undefined) update.name = data.name;
      if (data.role !== undefined) update.role = data.role;
      if (data.avatar !== undefined) update.avatar = data.avatar;
      if (data.rating !== undefined)
        update.rating = clamp(data.rating, 1, 5);
      if (data.quote !== undefined) update.quote = data.quote;
      if (data.company !== undefined) update.company = data.company;
      if (data.companyUrl !== undefined)
        update.company_url = data.companyUrl;
      if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;
      if (data.featured !== undefined) update.featured = data.featured;
      if (data.published !== undefined) update.published = data.published;
      const { data: row, error } = await supabase
        .from("testimonials")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (!error && row) return mapTestimonial(row);
    } catch {
      // fall through
    }
  }
  const t = await db.testimonial.update({ where: { id }, data });
  return t;
}

export async function deleteTestimonial(id: number) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);
      if (!error) return { success: true };
    } catch {
      // fall through
    }
  }
  await db.testimonial.delete({ where: { id } });
  return { success: true };
}

// ─── Blog post data access ──────────────────────────────────────────

export async function fetchBlogPosts(params: {
  status?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderby?: string;
  order?: string;
}) {
  const {
    status = "published",
    category,
    search,
    limit = 12,
    offset = 0,
    orderby = "created_at",
    order = "desc",
  } = params;

  if (supabase) {
    try {
      let query = supabase
        .from("blog_posts")
        .select("*", { count: "exact" });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      if (search) {
        query = query.or(
          `title.ilike.%${search}%,excerpt.ilike.%${search}%`
        );
      }
      // order
      const orderCol =
        orderby === "createdAt"
          ? "created_at"
          : orderby === "views"
          ? "views"
          : orderby === "publishedAt"
          ? "published_at"
          : "created_at";
      query = query.order(orderCol, {
        ascending: order !== "desc",
      });
      query = query.range(offset, offset + limit - 1);
      const { data, error, count } = await query;
      if (error) throw error;
      if (data) {
        let posts = data.map(mapBlogPost);
        // fetch categories
        const catIds = [
          ...new Set(
            posts.map((p) => p.categoryId).filter(Boolean)
          ),
        ];
        if (catIds.length > 0) {
          const { data: cats } = await supabase
            .from("blog_categories")
            .select("id, name, slug")
            .in("id", catIds);
          const catMap = new Map(
            (cats || []).map((c: any) => [c.id, c])
          );
          posts = posts.map((p) => ({
            ...p,
            category: p.categoryId
              ? catMap.get(p.categoryId) || null
              : null,
          }));
        }
        // filter by category slug if provided
        if (category) {
          posts = posts.filter(
            (p) => p.category?.slug === category
          );
        }
        return { items: posts, total: count ?? posts.length };
      }
    } catch {
      // fall through to prisma
    }
  }

  // Prisma fallback
  const where: any = {};
  if (status && status !== "all") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }
  const orderBy: any = {};
  if (orderby === "createdAt") orderBy.createdAt = order;
  else if (orderby === "views") orderBy.views = order;
  else if (orderby === "publishedAt") orderBy.publishedAt = order;
  else orderBy.createdAt = order;

  const [items, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: { category: true },
    }),
    db.blogPost.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage,
      coverAlt: p.coverAlt,
      author: p.author,
      authorBio: p.authorBio,
      authorAvatar: p.authorAvatar,
      categoryId: p.categoryId,
      category: p.category
        ? {
            id: p.category.id,
            name: p.category.name,
            slug: p.category.slug,
          }
        : null,
      tags:
        typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags,
      status: p.status,
      sortOrder: p.sortOrder,
      views: p.views,
      readingTime: p.readingTime,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      focusKeyword: p.focusKeyword,
      canonicalUrl: p.canonicalUrl,
      ogTitle: p.ogTitle,
      ogDescription: p.ogDescription,
      ogImage: p.ogImage,
      twitterTitle: p.twitterTitle,
      twitterDescription: p.twitterDescription,
      twitterImage: p.twitterImage,
      robotsMeta: p.robotsMeta,
      publishedAt: p.publishedAt,
      scheduledAt: p.scheduledAt,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
    total,
  };
}

export async function fetchBlogPostByIdOrSlug(
  idOrSlug: string,
  incrementViews = false
) {
  if (supabase) {
    try {
      let query = supabase.from("blog_posts").select("*");
      const isNumeric = /^\d+$/.test(idOrSlug);
      if (isNumeric) {
        query = query.eq("id", parseInt(idOrSlug, 10));
      } else {
        query = query.eq("slug", idOrSlug).eq("status", "published");
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (data) {
        // fetch category
        let category = null;
        if (data.category_id) {
          const { data: cat } = await supabase
            .from("blog_categories")
            .select("id, name, slug")
            .eq("id", data.category_id)
            .maybeSingle();
          if (cat) category = cat;
        }
        const post = mapBlogPost(data);
        post.category = category;

        if (incrementViews && isNumeric === false) {
          await supabase
            .from("blog_posts")
            .update({ views: (data.views || 0) + 1 })
            .eq("id", data.id);
        }
        return post;
      }
    } catch {
      // fall through
    }
  }

  // Prisma fallback
  const isNumeric = /^\d+$/.test(idOrSlug);
  let post;
  if (isNumeric) {
    post = await db.blogPost.findUnique({
      where: { id: parseInt(idOrSlug, 10) },
      include: { category: true },
    });
  } else {
    post = await db.blogPost.findFirst({
      where: { slug: idOrSlug, status: "published" },
      include: { category: true },
    });
    if (post && incrementViews) {
      await db.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
    }
  }
  if (!post) return null;
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    coverAlt: post.coverAlt,
    author: post.author,
    authorBio: post.authorBio,
    authorAvatar: post.authorAvatar,
    categoryId: post.categoryId,
    category: post.category
      ? {
          id: post.category.id,
          name: post.category.name,
          slug: post.category.slug,
        }
      : null,
    tags:
      typeof post.tags === "string" ? JSON.parse(post.tags) : post.tags,
    status: post.status,
    sortOrder: post.sortOrder,
    views: post.views,
    readingTime: post.readingTime,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    focusKeyword: post.focusKeyword,
    canonicalUrl: post.canonicalUrl,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
    twitterTitle: post.twitterTitle,
    twitterDescription: post.twitterDescription,
    twitterImage: post.twitterImage,
    robotsMeta: post.robotsMeta,
    publishedAt: post.publishedAt,
    scheduledAt: post.scheduledAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export async function createBlogPost(data: any) {
  if (supabase) {
    try {
      const insert: any = {
        title: data.title,
        slug: data.slug || slugify(data.title),
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        cover_image: data.coverImage ?? "",
        cover_alt: data.coverAlt ?? "",
        author: data.author ?? "ElevateEdge Digital",
        author_bio: data.authorBio ?? "",
        author_avatar: data.authorAvatar ?? "",
        category_id: data.categoryId ?? null,
        tags: JSON.stringify(data.tags || []),
        status: data.status ?? "draft",
        sort_order: data.sortOrder ?? null,
        reading_time: data.readingTime || calcReadingTime(data.content || ""),
        seo_title: data.seoTitle ?? "",
        seo_description: data.seoDescription ?? "",
        focus_keyword: data.focusKeyword ?? "",
        canonical_url: data.canonicalUrl ?? "",
        og_title: data.ogTitle ?? "",
        og_description: data.ogDescription ?? "",
        og_image: data.ogImage ?? "",
        twitter_title: data.twitterTitle ?? "",
        twitter_description: data.twitterDescription ?? "",
        twitter_image: data.twitterImage ?? "",
        robots_meta: data.robotsMeta ?? "index,follow",
        published_at:
          data.status === "published" ? new Date().toISOString() : null,
        scheduled_at: data.scheduledAt ?? null,
      };
      const { data: row, error } = await supabase
        .from("blog_posts")
        .insert(insert)
        .select()
        .single();
      if (!error && row) return mapBlogPost(row);
    } catch {
      // fall through
    }
  }
  const post = await db.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug || slugify(data.title),
      excerpt: data.excerpt ?? "",
      content: data.content ?? "",
      coverImage: data.coverImage ?? "",
      coverAlt: data.coverAlt ?? "",
      author: data.author ?? "ElevateEdge Digital",
      authorBio: data.authorBio ?? "",
      authorAvatar: data.authorAvatar ?? "",
      categoryId: data.categoryId ?? null,
      tags: JSON.stringify(data.tags || []),
      status: data.status ?? "draft",
      sortOrder: data.sortOrder ?? null,
      readingTime: data.readingTime || calcReadingTime(data.content || ""),
      publishedAt:
        data.status === "published" ? new Date() : null,
      scheduledAt: data.scheduledAt ?? null,
    },
  });
  return post;
}

export async function updateBlogPost(id: number, data: any) {
  // Save revision before updating
  await saveRevision(id, data);

  if (supabase) {
    try {
      const update: any = {};
      if (data.title !== undefined) update.title = data.title;
      if (data.slug !== undefined) update.slug = data.slug;
      if (data.excerpt !== undefined) update.excerpt = data.excerpt;
      if (data.content !== undefined) {
        update.content = data.content;
        update.reading_time = calcReadingTime(data.content);
      }
      if (data.coverImage !== undefined) update.cover_image = data.coverImage;
      if (data.coverAlt !== undefined) update.cover_alt = data.coverAlt;
      if (data.author !== undefined) update.author = data.author;
      if (data.authorBio !== undefined) update.author_bio = data.authorBio;
      if (data.authorAvatar !== undefined)
        update.author_avatar = data.authorAvatar;
      if (data.categoryId !== undefined) update.category_id = data.categoryId;
      if (data.tags !== undefined)
        update.tags = JSON.stringify(data.tags);
      if (data.status !== undefined) {
        update.status = data.status;
        if (data.status === "published") {
          // Set published_at if not already set
          const existing = await fetchBlogPostByIdOrSlug(String(id), false);
          if (existing && !existing.publishedAt) {
            update.published_at = new Date().toISOString();
          }
        }
      }
      if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;
      if (data.seoTitle !== undefined) update.seo_title = data.seoTitle;
      if (data.seoDescription !== undefined)
        update.seo_description = data.seoDescription;
      if (data.focusKeyword !== undefined)
        update.focus_keyword = data.focusKeyword;
      if (data.canonicalUrl !== undefined)
        update.canonical_url = data.canonicalUrl;
      if (data.ogTitle !== undefined) update.og_title = data.ogTitle;
      if (data.ogDescription !== undefined)
        update.og_description = data.ogDescription;
      if (data.ogImage !== undefined) update.og_image = data.ogImage;
      if (data.twitterTitle !== undefined)
        update.twitter_title = data.twitterTitle;
      if (data.twitterDescription !== undefined)
        update.twitter_description = data.twitterDescription;
      if (data.twitterImage !== undefined)
        update.twitter_image = data.twitterImage;
      if (data.robotsMeta !== undefined)
        update.robots_meta = data.robotsMeta;
      if (data.scheduledAt !== undefined)
        update.scheduled_at = data.scheduledAt;

      const { data: row, error } = await supabase
        .from("blog_posts")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (!error && row) return mapBlogPost(row);
    } catch {
      // fall through
    }
  }

  // Prisma fallback
  const update: any = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.excerpt !== undefined) update.excerpt = data.excerpt;
  if (data.content !== undefined) {
    update.content = data.content;
    update.readingTime = calcReadingTime(data.content);
  }
  if (data.coverImage !== undefined) update.coverImage = data.coverImage;
  if (data.coverAlt !== undefined) update.coverAlt = data.coverAlt;
  if (data.author !== undefined) update.author = data.author;
  if (data.authorBio !== undefined) update.authorBio = data.authorBio;
  if (data.authorAvatar !== undefined) update.authorAvatar = data.authorAvatar;
  if (data.categoryId !== undefined) update.categoryId = data.categoryId;
  if (data.tags !== undefined) update.tags = JSON.stringify(data.tags);
  if (data.status !== undefined) {
    update.status = data.status;
    if (data.status === "published") {
      const existing = await db.blogPost.findUnique({ where: { id } });
      if (existing && !existing.publishedAt) {
        update.publishedAt = new Date();
      }
    }
  }
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;
  if (data.seoTitle !== undefined) update.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined)
    update.seoDescription = data.seoDescription;
  if (data.focusKeyword !== undefined) update.focusKeyword = data.focusKeyword;
  if (data.canonicalUrl !== undefined) update.canonicalUrl = data.canonicalUrl;
  if (data.ogTitle !== undefined) update.ogTitle = data.ogTitle;
  if (data.ogDescription !== undefined)
    update.ogDescription = data.ogDescription;
  if (data.ogImage !== undefined) update.ogImage = data.ogImage;
  if (data.twitterTitle !== undefined) update.twitterTitle = data.twitterTitle;
  if (data.twitterDescription !== undefined)
    update.twitterDescription = data.twitterDescription;
  if (data.twitterImage !== undefined)
    update.twitterImage = data.twitterImage;
  if (data.robotsMeta !== undefined) update.robotsMeta = data.robotsMeta;
  if (data.scheduledAt !== undefined) update.scheduledAt = data.scheduledAt;

  return db.blogPost.update({ where: { id }, data: update });
}

export async function deleteBlogPost(id: number) {
  // Check current status
  const post = await fetchBlogPostByIdOrSlug(String(id), false);
  if (supabase && post) {
    try {
      if (post.status === "trash") {
        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", id);
        if (!error) return { success: true, permanent: true };
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .update({ status: "trash" })
          .eq("id", id);
        if (!error) return { success: true, permanent: false };
      }
    } catch {
      // fall through
    }
  }

  // Prisma fallback
  if (post && post.status === "trash") {
    await db.blogPost.delete({ where: { id } });
    return { success: true, permanent: true };
  }
  await db.blogPost.update({
    where: { id },
    data: { status: "trash" },
  });
  return { success: true, permanent: false };
}

export async function saveRevision(postId: number, newData: any) {
  // Get old values
  const old = await fetchBlogPostByIdOrSlug(String(postId), false);
  if (!old) return;

  const revisionData = {
    post_id: postId,
    title: old.title,
    content: old.content,
    excerpt: old.excerpt,
    editor_name: "admin",
    revision_note: newData.revisionNote || "",
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from("blog_revisions")
        .insert(revisionData);
      if (!error) return;
    } catch {
      // fall through
    }
  }
  // Prisma fallback
  await db.blogRevision.create({
    data: {
      postId,
      title: old.title,
      content: old.content,
      excerpt: old.excerpt,
      editorName: "admin",
      revisionNote: newData.revisionNote || "",
    },
  });
}

export async function fetchRevisions(postId: number) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_revisions")
        .select("id, title, editor_name, revision_note, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id,
          title: r.title,
          editorName: r.editor_name,
          revisionNote: r.revision_note,
          createdAt: r.created_at,
        }));
      }
    } catch {
      // fall through
    }
  }
  // Prisma fallback
  const revs = await db.blogRevision.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
  });
  return revs.map((r) => ({
    id: r.id,
    title: r.title,
    editorName: r.editorName,
    revisionNote: r.revisionNote,
    createdAt: r.createdAt,
  }));
}

// ─── Blog categories ────────────────────────────────────────────────

export async function fetchBlogCategories() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) {
        // fetch post counts
        const { data: posts } = await supabase
          .from("blog_posts")
          .select("category_id");
        const countMap = new Map<number, number>();
        (posts || []).forEach((p: any) => {
          if (p.category_id) {
            countMap.set(
              p.category_id,
              (countMap.get(p.category_id) || 0) + 1
            );
          }
        });
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          image: c.image ?? "",
          parentId: c.parent_id ?? null,
          sortOrder: c.sort_order ?? null,
          createdAt: c.created_at,
          postCount: countMap.get(c.id) || 0,
        }));
      }
    } catch {
      // fall through
    }
  }
  // Prisma fallback
  const cats = await db.blogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return cats.map((c) => ({
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
}

export async function createBlogCategory(data: any) {
  if (supabase) {
    try {
      const { data: row, error } = await supabase
        .from("blog_categories")
        .insert({
          name: data.name,
          slug: data.slug || slugify(data.name),
          description: data.description ?? "",
          image: data.image ?? "",
          parent_id: data.parentId ?? null,
          sort_order: data.sortOrder ?? null,
        })
        .select()
        .single();
      if (!error && row) return row;
    } catch {
      // fall through
    }
  }
  return db.blogCategory.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description ?? "",
      image: data.image ?? "",
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? null,
    },
  });
}

export async function updateBlogCategory(id: number, data: any) {
  if (supabase) {
    try {
      const update: any = {};
      if (data.name !== undefined) update.name = data.name;
      if (data.slug !== undefined) update.slug = data.slug;
      if (data.description !== undefined)
        update.description = data.description;
      if (data.image !== undefined) update.image = data.image;
      if (data.parentId !== undefined) update.parent_id = data.parentId;
      if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;
      const { data: row, error } = await supabase
        .from("blog_categories")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (!error && row) return row;
    } catch {
      // fall through
    }
  }
  const update: any = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.description !== undefined) update.description = data.description;
  if (data.image !== undefined) update.image = data.image;
  if (data.parentId !== undefined) update.parentId = data.parentId;
  if (data.sortOrder !== undefined) update.sortOrder = data.sortOrder;
  return db.blogCategory.update({ where: { id }, data: update });
}

export async function deleteBlogCategory(id: number) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("blog_categories")
        .delete()
        .eq("id", id);
      if (!error) return { success: true };
    } catch {
      // fall through
    }
  }
  await db.blogCategory.delete({ where: { id } });
  return { success: true };
}

// ─── Blog tags ─────────────────────────────────────────────────────

export async function fetchBlogTags() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_tags")
        .select("*")
        .order("name", { ascending: true });
      if (!error && data) return data;
    } catch {
      // fall through
    }
  }
  return db.blogTag.findMany({ orderBy: { name: "asc" } });
}

export async function createBlogTag(data: any) {
  if (supabase) {
    try {
      const { data: row, error } = await supabase
        .from("blog_tags")
        .insert({
          name: data.name,
          slug: data.slug || slugify(data.name),
          description: data.description ?? "",
        })
        .select()
        .single();
      if (!error && row) return row;
    } catch {
      // fall through
    }
  }
  return db.blogTag.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description ?? "",
    },
  });
}

export async function updateBlogTag(id: number, data: any) {
  if (supabase) {
    try {
      const update: any = {};
      if (data.name !== undefined) update.name = data.name;
      if (data.slug !== undefined) update.slug = data.slug;
      if (data.description !== undefined)
        update.description = data.description;
      const { data: row, error } = await supabase
        .from("blog_tags")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (!error && row) return row;
    } catch {
      // fall through
    }
  }
  const update: any = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.slug !== undefined) update.slug = data.slug;
  if (data.description !== undefined) update.description = data.description;
  return db.blogTag.update({ where: { id }, data: update });
}

export async function deleteBlogTag(id: number) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("blog_tags")
        .delete()
        .eq("id", id);
      if (!error) return { success: true };
    } catch {
      // fall through
    }
  }
  await db.blogTag.delete({ where: { id } });
  return { success: true };
}

// ─── Blog media ────────────────────────────────────────────────────

export async function fetchBlogMedia() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_media")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((m: any) => ({
          id: m.id,
          filename: m.filename,
          url: m.url,
          mimeType: m.mime_type ?? "",
          altText: m.alt_text ?? "",
          title: m.title ?? "",
          caption: m.caption ?? "",
          description: m.description ?? "",
          width: m.width ?? null,
          height: m.height ?? null,
          fileSize: m.file_size ?? 0,
          createdAt: m.created_at,
        }));
      }
    } catch {
      // fall through
    }
  }
  const media = await db.blogMedia.findMany({
    orderBy: { createdAt: "desc" },
  });
  return media.map((m) => ({
    id: m.id,
    filename: m.filename,
    url: m.url,
    mimeType: m.mimeType,
    altText: m.altText,
    title: m.title,
    caption: m.caption,
    description: m.description,
    width: m.width,
    height: m.height,
    fileSize: m.fileSize,
    createdAt: m.createdAt,
  }));
}

export async function createBlogMedia(data: any) {
  if (supabase) {
    try {
      const { data: row, error } = await supabase
        .from("blog_media")
        .insert({
          filename: data.filename,
          url: data.url,
          mime_type: data.mimeType ?? "",
          alt_text: data.altText ?? "",
          title: data.title ?? "",
          caption: data.caption ?? "",
          description: data.description ?? "",
          width: data.width ?? null,
          height: data.height ?? null,
          file_size: data.fileSize ?? 0,
        })
        .select()
        .single();
      if (!error && row) return row;
    } catch {
      // fall through
    }
  }
  return db.blogMedia.create({
    data: {
      filename: data.filename,
      url: data.url,
      mimeType: data.mimeType ?? "",
      altText: data.altText ?? "",
      title: data.title ?? "",
      caption: data.caption ?? "",
      description: data.description ?? "",
      width: data.width ?? null,
      height: data.height ?? null,
      fileSize: data.fileSize ?? 0,
    },
  });
}

export async function updateBlogMedia(id: number, data: any) {
  if (supabase) {
    try {
      const update: any = {};
      if (data.altText !== undefined) update.alt_text = data.altText;
      if (data.title !== undefined) update.title = data.title;
      if (data.caption !== undefined) update.caption = data.caption;
      if (data.description !== undefined)
        update.description = data.description;
      const { data: row, error } = await supabase
        .from("blog_media")
        .update(update)
        .eq("id", id)
        .select()
        .single();
      if (!error && row) return row;
    } catch {
      // fall through
    }
  }
  const update: any = {};
  if (data.altText !== undefined) update.altText = data.altText;
  if (data.title !== undefined) update.title = data.title;
  if (data.caption !== undefined) update.caption = data.caption;
  if (data.description !== undefined) update.description = data.description;
  return db.blogMedia.update({ where: { id }, data: update });
}

export async function deleteBlogMedia(id: number) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("blog_media")
        .delete()
        .eq("id", id);
      if (!error) return { success: true };
    } catch {
      // fall through
    }
  }
  await db.blogMedia.delete({ where: { id } });
  return { success: true };
}

// ─── Dashboard stats ───────────────────────────────────────────────

export async function fetchDashboardStats() {
  if (supabase) {
    try {
      const [
        totalRes,
        publishedRes,
        draftRes,
        scheduledRes,
        archivedRes,
        trashRes,
      ] = await Promise.all([
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase
          .from("blog_posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("blog_posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("blog_posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "scheduled"),
        supabase
          .from("blog_posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "archived"),
        supabase
          .from("blog_posts")
          .select("*", { count: "exact", head: true })
          .eq("status", "trash"),
      ]);

      // If any query errored (e.g. table doesn't exist), fall back to Prisma
      if (totalRes.error || publishedRes.error || draftRes.error) {
        throw new Error("Supabase table not found");
      }

      const { data: viewsData, error: viewsErr } = await supabase
        .from("blog_posts")
        .select("views");
      if (viewsErr) throw viewsErr;
      const totalViews = (viewsData || []).reduce(
        (sum: number, p: any) => sum + (p.views || 0),
        0
      );

      const { count: categories, error: catErr } = await supabase
        .from("blog_categories")
        .select("*", { count: "exact", head: true });
      if (catErr) throw catErr;
      const { count: tags, error: tagErr } = await supabase
        .from("blog_tags")
        .select("*", { count: "exact", head: true });
      if (tagErr) throw tagErr;

      return {
        totalArticles: totalRes.count || 0,
        published: publishedRes.count || 0,
        draft: draftRes.count || 0,
        scheduled: scheduledRes.count || 0,
        archived: archivedRes.count || 0,
        trash: trashRes.count || 0,
        totalViews,
        categories: categories || 0,
        tags: tags || 0,
      };
    } catch {
      // fall through to Prisma
    }
  }

  // Prisma fallback
  const [
    totalArticles,
    publishedCount,
    draftCount,
    scheduledCount,
    archivedCount,
    trashCount,
    totalViewsAgg,
    categoriesCount,
    tagsCount,
  ] = await Promise.all([
    db.blogPost.count(),
    db.blogPost.count({ where: { status: "published" } }),
    db.blogPost.count({ where: { status: "draft" } }),
    db.blogPost.count({ where: { status: "scheduled" } }),
    db.blogPost.count({ where: { status: "archived" } }),
    db.blogPost.count({ where: { status: "trash" } }),
    db.blogPost.aggregate({ _sum: { views: true } }),
    db.blogCategory.count(),
    db.blogTag.count(),
  ]);
  return {
    totalArticles,
    published: publishedCount,
    draft: draftCount,
    scheduled: scheduledCount,
    archived: archivedCount,
    trash: trashCount,
    totalViews: totalViewsAgg._sum.views || 0,
    categories: categoriesCount,
    tags: tagsCount,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function calcReadingTime(content: string): number {
  const words = content
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
