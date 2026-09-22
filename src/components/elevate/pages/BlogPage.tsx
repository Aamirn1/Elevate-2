"use client";

import { useCallback, useEffect, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface BlogPost {
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
  category?: { id: number; name: string; slug: string } | null;
  tags: string[];
  status: string;
  views: number;
  readingTime: number;
  publishedAt: string | null;
  createdAt: string;
}

const PAGE_SIZE = 12;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function readingLabel(min: number): string {
  if (!min || min < 1) return "1 min read";
  return `${min} min read`;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  useScrollReveal();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blog/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data: BlogCategory[] = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce search input → searchQuery (300ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch posts whenever filters change
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("status", "published");
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (activeCategory) params.set("category", activeCategory);
      if (searchQuery) params.set("search", searchQuery);
      params.set("orderby", "publishedAt");
      params.set("order", "desc");

      const res = await fetch(`/api/blog?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      setPosts(Array.isArray(data?.items) ? data.items : []);
      setTotal(typeof data?.total === "number" ? data.total : 0);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("Failed to load articles. Please try again.");
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [offset, activeCategory, searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(slug);
    setOffset(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const goPrev = () => {
    setOffset(Math.max(0, offset - PAGE_SIZE));
  };
  const goNext = () => {
    if (offset + PAGE_SIZE < total) {
      setOffset(offset + PAGE_SIZE);
    }
  };

  const visitPost = (slug: string) => {
    onNavigate(`/blog/${slug}`);
  };

  return (
    <>
      {/* Page Hero */}
      <section
        className="hero"
        style={{ minHeight: "50vh", padding: "160px 0 60px" }}
      >
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-blog"></i> Our Blog
            </div>
            <h1>
              <span className="gradient-text">Insights &amp;</span>
              <br />
              <span style={{ color: "var(--text-muted)" }}>Industry Tips</span>
            </h1>
            <p className="hero-sub">
              Stay ahead of the curve with our latest insights on web design,
              digital marketing, and business growth strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Filters + Search */}
      <section className="services-section" style={{ paddingTop: "60px" }}>
        <div className="container">
          {/* Category pills + search */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                flex: 1,
                minWidth: "260px",
              }}
            >
              <CategoryPill
                label="All"
                active={activeCategory === ""}
                onClick={() => handleCategoryClick("")}
              />
              {categories.map((c) => (
                <CategoryPill
                  key={c.id}
                  label={c.name}
                  active={activeCategory === c.slug}
                  onClick={() => handleCategoryClick(c.slug)}
                />
              ))}
            </div>

            <div
              style={{
                position: "relative",
                minWidth: "260px",
                maxWidth: "360px",
                flex: 1,
              }}
            >
              <i
                className="fas fa-search"
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  pointerEvents: "none",
                }}
              ></i>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search articles"
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  fontSize: "0.9rem",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "30px",
                  color: "var(--text)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(168, 85, 247, 0.5)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(168, 85, 247, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Blog grid */}
          {error ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--text-muted)",
              }}
            >
              <i
                className="fas fa-exclamation-circle"
                style={{
                  fontSize: "2.2rem",
                  marginBottom: "16px",
                  color: "var(--primary)",
                }}
              ></i>
              <p style={{ fontSize: "1.05rem" }}>{error}</p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: "16px" }}
                onClick={() => loadPosts()}
              >
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          ) : loading ? (
            <div className="services-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "var(--text-muted)",
              }}
            >
              <i
                className="fas fa-newspaper"
                style={{
                  fontSize: "3rem",
                  marginBottom: "20px",
                  color: "var(--primary)",
                  opacity: 0.6,
                }}
              ></i>
              <h3
                style={{
                  fontSize: "1.4rem",
                  marginBottom: "8px",
                  color: "var(--text)",
                }}
              >
                No articles found
              </h3>
              <p>
                {searchQuery || activeCategory
                  ? "Try a different search term or category."
                  : "Check back soon for new content."}
              </p>
              {(searchQuery || activeCategory) && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: "16px" }}
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setActiveCategory("");
                    setOffset(0);
                  }}
                >
                  <i className="fas fa-times"></i> Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="services-grid">
                {posts.map((post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    onClick={() => visitPost(post.slug)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {total > PAGE_SIZE && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    marginTop: "48px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={goPrev}
                    disabled={offset === 0}
                    style={{
                      opacity: offset === 0 ? 0.4 : 1,
                      cursor: offset === 0 ? "not-allowed" : "pointer",
                      padding: "10px 20px",
                      fontSize: "0.88rem",
                    }}
                  >
                    <i className="fas fa-arrow-left"></i> Prev
                  </button>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                      padding: "0 8px",
                    }}
                  >
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={goNext}
                    disabled={offset + PAGE_SIZE >= total}
                    style={{
                      opacity: offset + PAGE_SIZE >= total ? 0.4 : 1,
                      cursor:
                        offset + PAGE_SIZE >= total
                          ? "not-allowed"
                          : "pointer",
                      padding: "10px 20px",
                      fontSize: "0.88rem",
                    }}
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Ready to Elevate Your Business?</h2>
          <p>
            Contact us today and let&apos;s build something amazing together.
          </p>
          <a
            href="#/contact"
            className="btn btn-primary btn-pulse"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("/contact");
            }}
          >
            <i className="fas fa-bolt"></i> Order Now
          </a>
        </div>
      </section>
    </>
  );
}

/* --------------------------- sub-components ---------------------------- */

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 18px",
        fontSize: "0.82rem",
        fontWeight: 500,
        borderRadius: "30px",
        cursor: "pointer",
        border: active
          ? "1px solid var(--primary)"
          : "1px solid var(--border)",
        background: active
          ? "var(--gradient-primary)"
          : "var(--bg-card)",
        color: active ? "#fff" : "var(--text-muted)",
        transition: "all 0.2s var(--ease)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function BlogCard({
  post,
  onClick,
}: {
  post: BlogPost;
  onClick: () => void;
}) {
  const dateStr = formatDate(post.publishedAt || post.createdAt);
  const catName = post.category?.name;

  return (
    <article
      className="service-card reveal"
      style={{
        cursor: "pointer",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onClick={onClick}
    >
      {/* Cover image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          background: "var(--bg-surface)",
        }}
      >
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s var(--ease)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)",
              color: "var(--primary)",
              fontSize: "2rem",
            }}
          >
            <i className="fas fa-image"></i>
          </div>
        )}

        {/* Category overlay */}
        {catName && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "#fff",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "0.72rem",
              fontWeight: 600,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            {catName}
          </span>
        )}
      </div>

      {/* Body */}
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <h3
          style={{
            fontSize: "1.15rem",
            marginBottom: "10px",
            lineHeight: 1.35,
            color: "var(--text)",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text)";
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            fontSize: "0.86rem",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: "16px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {post.excerpt}
        </p>

        {/* Author + reading time + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "auto",
            paddingTop: "12px",
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
          }}
        >
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt={post.author}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--gradient-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {(post.author || "E").charAt(0).toUpperCase()}
            </div>
          )}
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              flex: 1,
              minWidth: "0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {post.author || "ElevateEdge"}
          </span>
          <span
            style={{
              fontSize: "0.74rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <i className="far fa-clock"></i> {readingLabel(post.readingTime)}
          </span>
          {dateStr && (
            <span
              style={{
                fontSize: "0.74rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="far fa-calendar"></i> {dateStr}
            </span>
          )}
        </div>

        {/* Read More */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            marginTop: "16px",
            padding: "8px 18px",
            fontSize: "0.85rem",
            alignSelf: "flex-start",
          }}
        >
          Read More <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </article>
  );
}

function BlogCardSkeleton() {
  return (
    <div
      className="service-card"
      style={{
        padding: 0,
        overflow: "hidden",
        opacity: 0.85,
      }}
    >
      <div
        className="blog-skeleton-shimmer"
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background:
            "linear-gradient(90deg, var(--bg-surface) 0%, var(--bg-card) 50%, var(--bg-surface) 100%)",
          backgroundSize: "200% 100%",
        }}
      ></div>
      <div style={{ padding: "24px" }}>
        <div
          style={{
            height: "1.25rem",
            background: "var(--bg-surface)",
            borderRadius: "8px",
            marginBottom: "12px",
            width: "85%",
          }}
        ></div>
        <div
          style={{
            height: "0.85rem",
            background: "var(--bg-surface)",
            borderRadius: "8px",
            marginBottom: "8px",
            width: "100%",
          }}
        ></div>
        <div
          style={{
            height: "0.85rem",
            background: "var(--bg-surface)",
            borderRadius: "8px",
            marginBottom: "8px",
            width: "92%",
          }}
        ></div>
        <div
          style={{
            height: "0.85rem",
            background: "var(--bg-surface)",
            borderRadius: "8px",
            marginBottom: "20px",
            width: "70%",
          }}
        ></div>
        <div
          style={{
            height: "32px",
            background: "var(--bg-surface)",
            borderRadius: "8px",
            width: "120px",
          }}
        ></div>
      </div>
    </div>
  );
}
