"use client";

import { useEffect, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";
import { fallbackProjects, fallbackCategories } from "../fallbackData";

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  url: string;
  sortOrder: number | null;
  category?: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  sortOrder: number | null;
  createdAt: string;
}

interface PortfolioPageProps {
  onNavigate: (path: string) => void;
}

export function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  useScrollReveal();
  const [projects, setProjects] = useState<Project[]>(
    fallbackProjects as Project[]
  );
  const [categories, setCategories] = useState<Category[]>(
    fallbackCategories as Category[]
  );

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProjects(data);
      })
      .catch((err) => console.warn("Failed to fetch projects", err));
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.warn("Failed to fetch categories", err));
  }, []);

  // Group projects by category, only show categories that have projects
  const categoriesWithProjects = categories
    .map((cat) => ({
      ...cat,
      projects: projects.filter((p) => p.category === cat.name),
    }))
    .filter((c) => c.projects.length > 0);

  // Also include projects with no category in an "Other" section
  const uncategorizedProjects = projects.filter(
    (p) => !p.category || !categories.some((c) => c.name === p.category)
  );

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
              <i className="fas fa-briefcase"></i> Our Work
            </div>
            <h1>
              <span className="gradient-text">Check Out Our</span>
              <br />
              Recent Projects
            </h1>
            <p className="hero-sub">
              We&apos;ve helped businesses across industries build their online
              presence. Browse our portfolio by category below.
            </p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          {categoriesWithProjects.map((cat) => (
            <div className="category-section reveal" key={cat.id}>
              <div className="category-section-header">
                <div className="category-section-title">
                  <div className="category-section-icon">
                    <i className={`fas ${cat.icon || "fa-folder"}`}></i>
                  </div>
                  <h3>{cat.name}</h3>
                </div>
              </div>
              <div className="category-projects-grid">
                {cat.projects.map((p) => (
                  <div className="testimonial-card" key={p.id}>
                    <div className="testimonial-card-img">
                      <img src={p.image} alt={p.title} loading="lazy" />
                      <div className="testimonial-card-overlay">
                        <span className="testimonial-card-category">
                          <i className={`fas ${cat.icon || "fa-folder"}`}></i>{" "}
                          {cat.name}
                        </span>
                      </div>
                    </div>
                    <div className="testimonial-card-body">
                      <h4>{p.title}</h4>
                      <p>{p.description}</p>
                      <div className="testimonial-card-tags">
                        {(p.tags || []).slice(0, 3).map((t, idx) => (
                          <span key={idx} className="testimonial-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                      {p.url && p.url !== "#" && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline testimonial-visit-btn"
                        >
                          <i className="fas fa-external-link-alt"></i> Visit
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {uncategorizedProjects.length > 0 && (
            <div className="category-section reveal">
              <div className="category-section-header">
                <div className="category-section-title">
                  <div className="category-section-icon">
                    <i className="fas fa-folder"></i>
                  </div>
                  <h3>Other Projects</h3>
                </div>
              </div>
              <div className="category-projects-grid">
                {uncategorizedProjects.map((p) => (
                  <div className="testimonial-card" key={p.id}>
                    <div className="testimonial-card-img">
                      <img src={p.image} alt={p.title} loading="lazy" />
                    </div>
                    <div className="testimonial-card-body">
                      <h4>{p.title}</h4>
                      <p>{p.description}</p>
                      <div className="testimonial-card-tags">
                        {(p.tags || []).slice(0, 3).map((t, idx) => (
                          <span key={idx} className="testimonial-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                      {p.url && p.url !== "#" && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline testimonial-visit-btn"
                        >
                          <i className="fas fa-external-link-alt"></i> Visit
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px 60px",
                color: "var(--text-muted)",
              }}
            >
              <i
                className="fas fa-folder-open"
                style={{
                  fontSize: "2rem",
                  marginBottom: "12px",
                  display: "block",
                }}
              ></i>
              No projects found.
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container reveal">
          <h2>Want Results Like These?</h2>
          <p>
            Let us build a stunning website and run powerful campaigns for your
            business.
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
