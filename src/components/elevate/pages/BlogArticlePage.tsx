"use client";

import { useCallback, useEffect, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";

interface BlogArticlePageProps {
  slug: string;
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
  category?: BlogCategory | null;
  tags: string[];
  status: string;
  views: number;
  readingTime: number;
  publishedAt: string | null;
  createdAt: string;
}

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

export function BlogArticlePage({ slug, onNavigate }: BlogArticlePageProps) {
  useScrollReveal();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    setPost(null);
    setRelated([]);
    try {
      const res = await fetch(`/api/blog/${encodeURIComponent(slug)}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to load article");
      const data: BlogPost = await res.json();
      setPost(data);

      // Load related posts (same category, excluding current; fallback to latest)
      try {
        const params = new URLSearchParams();
        params.set("status", "published");
        params.set("limit", "4");
        if (data.category?.slug) {
          params.set("category", data.category.slug);
        }
        const rRes = await fetch(`/api/blog?${params.toString()}`);
        if (rRes.ok) {
          const rData = await rRes.json();
          let items: BlogPost[] = Array.isArray(rData?.items) ? rData.items : [];
          items = items.filter((p) => p.id !== data.id).slice(0, 3);
          // If we don't have 3 yet, try fetching latest to fill the gaps
          if (items.length < 3) {
            const fallbackParams = new URLSearchParams();
            fallbackParams.set("status", "published");
            fallbackParams.set("limit", "8");
            const fRes = await fetch(`/api/blog?${fallbackParams.toString()}`);
            if (fRes.ok) {
              const fData = await fRes.json();
              const fallbackItems: BlogPost[] = Array.isArray(fData?.items)
                ? fData.items
                : [];
              const existingIds = new Set<number>([data.id, ...items.map((p) => p.id)]);
              for (const fp of fallbackItems) {
                if (items.length >= 3) break;
                if (!existingIds.has(fp.id)) {
                  items.push(fp);
                  existingIds.add(fp.id);
                }
              }
            }
          }
          setRelated(items);
        }
      } catch (err) {
        console.error("Failed to load related posts:", err);
      }
    } catch (err) {
      console.error("Failed to load article:", err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPost();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [loadPost]);

  const visitPost = (targetSlug: string) => {
    onNavigate(`/blog/${targetSlug}`);
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  /* ------------------------------- Loading ------------------------------ */
  if (loading) {
    return (
      <section
        className="services-section"
        style={{ paddingTop: "140px", paddingBottom: "80px" }}
      >
        <div className="container" style={{ maxWidth: "760px" }}>
          <button
            type="button"
            onClick={() => onNavigate("/blog")}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "0.9rem",
              marginBottom: "24px",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Blog
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                border: "2px solid var(--primary)",
                borderTopColor: "transparent",
                display: "inline-block",
                animation: "blog-spin 0.8s linear infinite",
              }}
            ></span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Loading article...
            </span>
          </div>

          <div
            style={{
              height: "2.2rem",
              background: "var(--bg-surface)",
              borderRadius: "10px",
              marginBottom: "20px",
              width: "85%",
            }}
          ></div>
          <div
            style={{
              height: "1rem",
              background: "var(--bg-surface)",
              borderRadius: "8px",
              marginBottom: "12px",
              width: "55%",
            }}
          ></div>
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              background: "var(--bg-surface)",
              borderRadius: "12px",
              marginBottom: "28px",
              marginTop: "24px",
            }}
          ></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "0.95rem",
                background: "var(--bg-surface)",
                borderRadius: "6px",
                marginBottom: "12px",
                width: i === 5 ? "70%" : "100%",
              }}
            ></div>
          ))}

          <style>{`@keyframes blog-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    );
  }

  /* ----------------------------- Not found ------------------------------ */
  if (notFound || !post) {
    return (
      <section
        className="services-section"
        style={{ paddingTop: "140px", paddingBottom: "80px" }}
      >
        <div
          className="container"
          style={{
            maxWidth: "640px",
            textAlign: "center",
          }}
        >
          <i
            className="fas fa-search"
            style={{
              fontSize: "3rem",
              color: "var(--primary)",
              opacity: 0.5,
              marginBottom: "20px",
            }}
          ></i>
          <h1
            style={{
              fontSize: "2rem",
              marginBottom: "12px",
              color: "var(--text)",
            }}
          >
            Article not found
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            The article you&apos;re looking for doesn&apos;t exist, has been
            removed, or hasn&apos;t been published yet.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate("/blog")}
          >
            <i className="fas fa-arrow-left"></i> Back to Blog
          </button>
        </div>
      </section>
    );
  }

  const dateStr = formatDate(post.publishedAt || post.createdAt);
  const catName = post.category?.name;
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = encodeURIComponent(post.title);
  const shareUrlEnc = encodeURIComponent(shareUrl);

  return (
    <>
      <article
        className="services-section"
        style={{ paddingTop: "140px", paddingBottom: "60px" }}
      >
        <div className="container" style={{ maxWidth: "760px" }}>
          {/* Back button */}
          <button
            type="button"
            onClick={() => onNavigate("/blog")}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "0.9rem",
              marginBottom: "24px",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "gap 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.gap = "10px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.gap = "6px";
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Blog
          </button>

          {/* Article hero */}
          <header style={{ marginBottom: "32px" }}>
            {catName && (
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(168, 85, 247, 0.12)",
                  color: "var(--primary-light, #c084fc)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {catName}
              </span>
            )}
            <h1
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                lineHeight: 1.2,
                fontWeight: 800,
                marginBottom: "20px",
                color: "var(--text)",
              }}
            >
              {post.title}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
                color: "var(--text-muted)",
                fontSize: "0.88rem",
              }}
            >
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--border)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  {(post.author || "E").charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ color: "var(--text)", fontWeight: 500 }}>
                {post.author || "ElevateEdge Digital"}
              </span>
              {dateStr && (
                <>
                  <span style={{ color: "var(--border)" }}>·</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="far fa-calendar"></i> {dateStr}
                  </span>
                </>
              )}
              <span style={{ color: "var(--border)" }}>·</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <i className="far fa-clock"></i> {readingLabel(post.readingTime)}
              </span>
              <span style={{ color: "var(--border)" }}>·</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <i className="far fa-eye"></i> {post.views} views
              </span>
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                borderRadius: "14px",
                marginBottom: "32px",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={post.coverImage}
                alt={post.coverAlt || post.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}

          {/* Article content */}
          <div
            className="blog-article-content reveal"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginRight: "4px",
                  alignSelf: "center",
                }}
              >
                <i className="fas fa-tags"></i> Tags:
              </span>
              {post.tags.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  style={{
                    background: "rgba(168, 85, 247, 0.08)",
                    color: "var(--primary-light, #c084fc)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share buttons */}
          <div
            style={{
              marginTop: "28px",
              padding: "20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                fontWeight: 500,
                marginRight: "4px",
              }}
            >
              <i className="fas fa-share-alt"></i> Share:
            </span>

            <ShareButton
              href={`https://wa.me/?text=${shareTitle}%20${shareUrlEnc}`}
              icon="fab fa-whatsapp"
              label="WhatsApp"
              color="#25D366"
            />
            <ShareButton
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEnc}`}
              icon="fab fa-facebook-f"
              label="Facebook"
              color="#1877F2"
            />
            <ShareButton
              href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrlEnc}`}
              icon="fab fa-x-twitter"
              label="X (Twitter)"
              color="#000000"
            />
            <ShareButton
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEnc}`}
              icon="fab fa-linkedin-in"
              label="LinkedIn"
              color="#0A66C2"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: copied
                  ? "rgba(34, 197, 94, 0.12)"
                  : "var(--bg-surface)",
                color: copied ? "#22c55e" : "var(--text-muted)",
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              title="Copy link"
            >
              <i className={copied ? "fas fa-check" : "fas fa-link"}></i>
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Author bio box */}
          {post.authorBio && (
            <div
              style={{
                marginTop: "32px",
                padding: "24px",
                background:
                  "linear-gradient(160deg, var(--bg-card) 0%, rgba(168, 85, 247, 0.04) 100%)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--primary)",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "var(--gradient-primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(post.author || "E").charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  Written by
                </div>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    marginBottom: "8px",
                    color: "var(--text)",
                  }}
                >
                  {post.author}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {post.authorBio}
                </p>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="services-section" style={{ paddingTop: "20px" }}>
          <div className="container">
            <h2
              className="reveal"
              style={{
                fontSize: "1.8rem",
                marginBottom: "32px",
                textAlign: "center",
              }}
            >
              <span className="gradient-text">Related</span> Articles
            </h2>
            <div className="services-grid">
              {related.map((p) => (
                <RelatedCard
                  key={p.id}
                  post={p}
                  onClick={() => visitPost(p.slug)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Want Results Like These?</h2>
          <p>
            Let&apos;s build your success story. Reach out today and start your
            journey to digital excellence.
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

function ShareButton({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={`Share on ${label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--bg-surface)",
        color: "var(--text-muted)",
        fontSize: "0.82rem",
        cursor: "pointer",
        transition: "all 0.2s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = color;
        e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <i className={icon}></i>
      <span style={{ display: "inline" }}>{label}</span>
    </a>
  );
}

function RelatedCard({
  post,
  onClick,
}: {
  post: BlogPost;
  onClick: () => void;
}) {
  const dateStr = formatDate(post.publishedAt || post.createdAt);
  return (
    <article
      className="service-card reveal"
      style={{
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={onClick}
    >
      <div
        style={{
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
              fontSize: "1.8rem",
            }}
          >
            <i className="fas fa-image"></i>
          </div>
        )}
      </div>
      <div style={{ padding: "20px" }}>
        <h3
          style={{
            fontSize: "1.02rem",
            marginBottom: "10px",
            lineHeight: 1.4,
            color: "var(--text)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.title}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "var(--text-muted)",
            fontSize: "0.74rem",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <i className="far fa-clock"></i> {readingLabel(post.readingTime)}
          </span>
          {dateStr && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <i className="far fa-calendar"></i> {dateStr}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
