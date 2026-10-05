/**
 * Supabase ↔ API response mapping helpers.
 *
 * The Supabase migration script (`scripts/supabase-migration.sql`) creates
 * tables with snake_case column names (Supabase convention). The existing
 * API contracts (and the frontend) expect camelCase field names. These
 * helpers translate a raw Supabase row into the camelCase shape the
 * frontend already consumes via the Prisma path, so both code paths
 * return identical JSON.
 */

// ─────────────────────────────────────────────
// Types (subset of fields the frontend relies on)
// ─────────────────────────────────────────────
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  company: string;
  companyUrl: string;
  sortOrder: number;
  featured: boolean;
  published: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BlogCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  author: string;
  authorBio: string;
  authorAvatar: string;
  categoryId: number | null;
  category: BlogCategoryRef | null;
  tags: string[];
  status: string;
  sortOrder: number | null;
  views: number;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robotsMeta: string;
  publishedAt: Date | string | null;
  scheduledAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: number | null;
  sortOrder: number | null;
  createdAt: Date | string;
  postCount?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt: Date | string;
}

export interface BlogRevision {
  id: number;
  postId: number;
  title: string;
  content: string;
  excerpt: string;
  editorName: string;
  revisionNote: string;
  createdAt: Date | string;
}

export interface BlogMedia {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  altText: string;
  title: string;
  caption: string;
  description: string;
  width: number | null;
  height: number | null;
  fileSize: number;
  createdAt: Date | string;
}

function dateField(value: unknown): Date | string {
  if (value === null || value === undefined) return new Date(0).toISOString();
  if (value instanceof Date) return value;
  return String(value);
}

function toNullableDateField(value: unknown): Date | string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  return String(value);
}
function parseTagsValue(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw !== "string") return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// ─────────────────────────────────────────────
// Mappers (snake_case row → camelCase object)
// ─────────────────────────────────────────────
export function mapTestimonial(t: Record<string, unknown>): Testimonial {
  return {
    id: toNumber(t.id),
    name: String(t.name ?? ""),
    role: String(t.role ?? ""),
    avatar: String(t.avatar ?? ""),
    rating: toNumber(t.rating, 5),
    quote: String(t.quote ?? ""),
    company: String(t.company ?? ""),
    companyUrl: String(t.company_url ?? ""),
    sortOrder: toNumber(t.sort_order, 0),
    featured: Boolean(t.featured ?? false),
    published: t.published === undefined ? true : Boolean(t.published),
    createdAt: dateField(t.created_at),
    updatedAt: dateField(t.updated_at),
  };
}

export function mapBlogCategory(c: Record<string, unknown>): BlogCategory {
  return {
    id: toNumber(c.id),
    name: String(c.name ?? ""),
    slug: String(c.slug ?? ""),
    description: String(c.description ?? ""),
    image: String(c.image ?? ""),
    parentId: toNullableNumber(c.parent_id),
    sortOrder: toNullableNumber(c.sort_order),
    createdAt: dateField(c.created_at),
    postCount: c.post_count !== undefined ? toNumber(c.post_count, 0) : undefined,
  };
}

export function mapBlogTag(t: Record<string, unknown>): BlogTag {
  return {
    id: toNumber(t.id),
    name: String(t.name ?? ""),
    slug: String(t.slug ?? ""),
    description: String(t.description ?? ""),
    createdAt: dateField(t.created_at),
  };
}

export function mapBlogRevision(r: Record<string, unknown>): BlogRevision {
  return {
    id: toNumber(r.id),
    postId: toNumber(r.post_id),
    title: String(r.title ?? ""),
    content: String(r.content ?? ""),
    excerpt: String(r.excerpt ?? ""),
    editorName: String(r.editor_name ?? "admin"),
    revisionNote: String(r.revision_note ?? ""),
    createdAt: dateField(r.created_at),
  };
}

export function mapBlogMedia(m: Record<string, unknown>): BlogMedia {
  return {
    id: toNumber(m.id),
    filename: String(m.filename ?? ""),
    url: String(m.url ?? ""),
    mimeType: String(m.mime_type ?? ""),
    altText: String(m.alt_text ?? ""),
    title: String(m.title ?? ""),
    caption: String(m.caption ?? ""),
    description: String(m.description ?? ""),
    width: toNullableNumber(m.width),
    height: toNullableNumber(m.height),
    fileSize: toNumber(m.file_size, 0),
    createdAt: dateField(m.created_at),
  };
}

export function mapBlogPost(
  p: Record<string, unknown>,
  category?: BlogCategoryRef | null
): BlogPost {
  return {
    id: toNumber(p.id),
    title: String(p.title ?? ""),
    slug: String(p.slug ?? ""),
    excerpt: String(p.excerpt ?? ""),
    content: String(p.content ?? ""),
    coverImage: String(p.cover_image ?? ""),
    coverAlt: String(p.cover_alt ?? ""),
    author: String(p.author ?? "ElevateEdge Digital"),
    authorBio: String(p.author_bio ?? ""),
    authorAvatar: String(p.author_avatar ?? ""),
    categoryId: toNullableNumber(p.category_id),
    category:
      category !== undefined
        ? category
        : p.category
          ? (p.category as BlogCategoryRef)
          : null,
    tags: parseTagsValue(p.tags),
    status: String(p.status ?? "draft"),
    sortOrder: toNullableNumber(p.sort_order),
    views: toNumber(p.views, 0),
    readingTime: toNumber(p.reading_time, 0),
    seoTitle: String(p.seo_title ?? ""),
    seoDescription: String(p.seo_description ?? ""),
    focusKeyword: String(p.focus_keyword ?? ""),
    canonicalUrl: String(p.canonical_url ?? ""),
    ogTitle: String(p.og_title ?? ""),
    ogDescription: String(p.og_description ?? ""),
    ogImage: String(p.og_image ?? ""),
    twitterTitle: String(p.twitter_title ?? ""),
    twitterDescription: String(p.twitter_description ?? ""),
    twitterImage: String(p.twitter_image ?? ""),
    robotsMeta: String(p.robots_meta ?? "index,follow"),
    publishedAt: toNullableDateField(p.published_at),
    scheduledAt: toNullableDateField(p.scheduled_at),
    createdAt: dateField(p.created_at),
    updatedAt: dateField(p.updated_at),
  };
}

// ─────────────────────────────────────────────
// Fallback helper — try Supabase first, fall back to Prisma on any error
// ─────────────────────────────────────────────
export async function withFallback<T>(
  supabaseFn: () => Promise<T>,
  prismaFn: () => Promise<T>
): Promise<T> {
  try {
    return await supabaseFn();
  } catch (err) {
    console.warn("[supabase-fallback] Supabase failed, falling back to Prisma:", err);
    return await prismaFn();
  }
}

/**
 * Determine whether a Supabase response should trigger the Prisma fallback.
 * Returns `true` if the error indicates the tables don't exist yet
 * (schema not migrated) OR any other request/network error.
 */
export function isSupabaseMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  if (e.code && (e.code === "PGRST205" || e.code === "42P01" || e.code === "404"))
    return true;
  if (e.message) {
    const m = e.message.toLowerCase();
    if (
      m.includes("does not exist") ||
      m.includes("could not find") ||
      m.includes("relation") ||
      m.includes("schema") ||
      m.includes("failed to fetch")
    )
      return true;
  }
  return false;
}
