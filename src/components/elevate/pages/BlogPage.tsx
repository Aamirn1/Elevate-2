"use client";

import { useScrollReveal } from "../useScrollReveal";

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

const blogPosts = [
  {
    id: 1,
    title: "10 Web Design Trends That Will Dominate in 2026",
    excerpt:
      "From immersive 3D elements to bold typography, discover the design trends that will shape the web in 2026 and how to implement them in your projects.",
    category: "Web Design",
    date: "Jan 15, 2026",
    readTime: "5 min read",
    icon: "fa-paint-brush",
  },
  {
    id: 2,
    title: "How Digital Marketing Can 2x Your Business Growth",
    excerpt:
      "Learn proven digital marketing strategies that have helped businesses double their growth. From Google Ads to social media, we cover it all.",
    category: "Digital Marketing",
    date: "Jan 10, 2026",
    readTime: "7 min read",
    icon: "fa-chart-line",
  },
  {
    id: 3,
    title: "Why Every Business Needs a Professional Website in 2026",
    excerpt:
      "Your website is your digital storefront. Discover why having a professional website is no longer optional but essential for business success.",
    category: "Business",
    date: "Jan 5, 2026",
    readTime: "4 min read",
    icon: "fa-globe",
  },
  {
    id: 4,
    title: "The Ultimate Guide to Social Media Management",
    excerpt:
      "Master social media management with our comprehensive guide. Learn content strategies, scheduling tips, and engagement techniques that work.",
    category: "Social Media",
    date: "Dec 28, 2025",
    readTime: "8 min read",
    icon: "fa-hashtag",
  },
  {
    id: 5,
    title: "SEO Optimization: Rank Higher on Google in 2026",
    excerpt:
      "Stay ahead of the competition with the latest SEO strategies. Learn how to optimize your website for better search rankings and more traffic.",
    category: "SEO",
    date: "Dec 20, 2025",
    readTime: "6 min read",
    icon: "fa-search",
  },
  {
    id: 6,
    title: "Mobile-First Design: Why It Matters More Than Ever",
    excerpt:
      "With over 60% of web traffic coming from mobile devices, mobile-first design is critical. Here's how to ensure your website delivers on every screen.",
    category: "Web Design",
    date: "Dec 15, 2025",
    readTime: "5 min read",
    icon: "fa-mobile-alt",
  },
];

export function BlogPage({ onNavigate }: BlogPageProps) {
  useScrollReveal();

  return (
    <>
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
              Industry Tips
            </h1>
            <p className="hero-sub">
              Stay ahead of the curve with our latest insights on web design,
              digital marketing, and business growth strategies.
            </p>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="services-grid">
            {blogPosts.map((post, i) => (
              <div
                className="service-card reveal"
                key={post.id}
                style={{ cursor: "pointer" }}
              >
                <div className="service-icon">
                  <i className={`fas ${post.icon}`}></i>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(168, 85, 247, 0.12)",
                      color: "var(--primary-light)",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {post.category}
                  </span>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <i className="far fa-clock"></i> {post.readTime}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.15rem", marginBottom: "10px" }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: "0.88rem" }}>{post.excerpt}</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <i className="far fa-calendar"></i> {post.date}
                  </span>
                  <a
                    href="https://wa.me/923110523073"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--primary)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Read More <i className="fas fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
