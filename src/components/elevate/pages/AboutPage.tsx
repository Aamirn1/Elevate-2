"use client";

import { useEffect, useRef } from "react";
import { useScrollReveal } from "../useScrollReveal";

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  useScrollReveal();
  const statsGridRef = useRef<HTMLDivElement>(null);

  // Animate stat counters when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const nums = entry.target.querySelectorAll<HTMLElement>(".stat-num");
            nums.forEach((num) => {
              const target = parseInt(
                num.getAttribute("data-target") || "0",
                10
              );
              if (!target) return;
              const suffix = num.textContent?.replace(/[0-9]/g, "") || "";
              let current = 0;
              const increment = Math.ceil(target / 50);
              const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                  current = target;
                  clearInterval(timer);
                }
                num.textContent = current + suffix;
              }, 40);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsGridRef.current) observer.observe(statsGridRef.current);
    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: "fa-lightbulb",
      title: "Innovation",
      desc: "We stay ahead of trends to deliver cutting-edge solutions.",
    },
    {
      icon: "fa-handshake",
      title: "Partnership",
      desc: "Your success is our success. We work as an extension of your team.",
    },
    {
      icon: "fa-shield-alt",
      title: "Integrity",
      desc: "Transparent pricing, honest communication, real results.",
    },
    {
      icon: "fa-trophy",
      title: "Excellence",
      desc: "We never settle for \"good enough.\" Every project is our best work.",
    },
  ];

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
              <i className="fas fa-users"></i> About Us
            </div>
            <h1>
              <span className="gradient-text">The Team Behind</span>
              <br />
              Your Growth
            </h1>
            <p className="hero-sub">
              We&apos;re a passionate team of designers, developers, and
              marketers dedicated to helping businesses thrive online.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text reveal-left">
              <h2>
                We Help Businesses{" "}
                <span className="gradient-text">Reach New Heights</span>
              </h2>
              <p>
                At ElevateEdge Digital, we believe every business — big or small
                — deserves a powerful online presence. Founded with a mission to
                make premium digital services accessible and affordable,
                we&apos;ve helped dozens of businesses transform their digital
                footprint.
              </p>
              <p>
                We don&apos;t just build websites or run ads. We craft digital
                experiences that connect your brand with your audience, drive
                engagement, and convert visitors into loyal customers.
              </p>

              <div className="about-values">
                {values.map((v, i) => (
                  <div className="value-card" key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <i className={`fas ${v.icon}`} style={{ flexShrink: "0" }}></i>
                      <h4 style={{ margin: "0" }}>{v.title}</h4>
                    </div>
                    <p>{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-visual reveal-right">
              <div className="stats-grid" ref={statsGridRef}>
                <div className="stat-card">
                  <div className="stat-num" data-target="150">
                    0+
                  </div>
                  <div className="stat-label">Projects Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" data-target="50">
                    0+
                  </div>
                  <div className="stat-label">Happy Clients</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" data-target="98">
                    0%
                  </div>
                  <div className="stat-label">Satisfaction Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" data-target="3">
                    0+
                  </div>
                  <div className="stat-label">Years of Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="services-section"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="container">
          <div className="section-header reveal">
            <h2>Why Choose ElevateEdge?</h2>
            <p>Here&apos;s what sets us apart from the rest.</p>
          </div>
          <div className="services-grid">
            {[
              {
                icon: "fa-dollar-sign",
                title: "Budget-Friendly",
                desc: "Premium quality doesn't have to break the bank. Our packages are designed to fit any budget while delivering maximum value.",
              },
              {
                icon: "fa-clock",
                title: "Fast Delivery",
                desc: "We respect your time. Most projects are delivered within 1–2 weeks, without compromising on quality or attention to detail.",
              },
              {
                icon: "fa-headset",
                title: "24/7 Support",
                desc: "Got a question at midnight? No problem. Our team is always available via chat and WhatsApp to assist you.",
              },
              {
                icon: "fa-sync-alt",
                title: "Free Revisions",
                desc: "Not 100% happy? We offer free revisions to make sure the final product is exactly what you envisioned.",
              },
            ].map((s, i) => (
              <div className="service-card reveal" key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div className="service-icon" style={{ marginBottom: "0" }}>
                    <i className={`fas ${s.icon}`}></i>
                  </div>
                  <h3 style={{ margin: "0" }}>{s.title}</h3>
                </div>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container reveal">
          <h2>Ready to Elevate Your Business?</h2>
          <p>
            Ready to take your business to the next level? We&apos;d love to
            hear from you.
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
