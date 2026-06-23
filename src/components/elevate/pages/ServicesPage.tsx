"use client";

import { useScrollReveal } from "../useScrollReveal";

interface ServicesPageProps {
  onNavigate: (path: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  useScrollReveal();

  const services = [
    {
      slug: "web-development",
      icon: "fa-laptop-code",
      title: "Custom Website Development",
      desc: "We build responsive, multi-page websites tailored to any industry — retail, food, professional services, and more. Each site features modern design elements, mobile-friendly layouts, and engaging animations.",
      visual: null,
    },
    {
      slug: "digital-marketing",
      icon: "fa-bullhorn",
      title: "Digital Marketing & Ads",
      desc: "We run data-driven marketing campaigns across Google Ads, Facebook, and Instagram to boost your online presence. Our budget-friendly packages maximize your ROI with targeted strategies that deliver real, measurable results.",
      visual: "growth",
    },
    {
      slug: "social-media",
      icon: "fa-hashtag",
      title: "Social Media Management",
      desc: "Our team creates and manages your business's social media profiles — content calendars, eye-catching graphics, and strategic postings to engage your customers and grow your following organically.",
      visual: "social",
    },
    {
      slug: "app-development",
      icon: "fa-mobile-alt",
      title: "App Development for Business",
      desc: "We design and develop premium iOS and Android applications that provide a seamless mobile experience for your customers. From intuitive user interfaces to powerful backend integrations, we build apps that drive engagement and growth.",
      visual: null,
    },
    {
      slug: "saas-solutions",
      icon: "fa-cogs",
      title: "Software Development (SAAS)",
      desc: "Build scalable, cloud-based software solutions tailored for business management. We specialize in creating custom SaaS platforms that automate workflows, manage data efficiently, and scale as your business grows.",
      visual: null,
    },
    {
      slug: "virtual-assistant",
      icon: "fa-headset",
      title: "Virtual Assistant Service",
      desc: "A dedicated virtual assistant service for businesses to manage daily business operations and handle client-side queries efficiently.",
      visual: null,
    },
  ];

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
              <i className="fas fa-th-large"></i> Our Services
            </div>
            <h1>
              <span className="gradient-text">Services That</span>
              <br />
              Drive Results
            </h1>
            <p className="hero-sub">
              Everything you need to establish a powerful online presence and
              grow your business — all at budget-friendly rates.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="services-detail-section">
        <div className="container">
          <div className="services-detail-grid">
            {services.map((s, i) => (
              <div
                className="service-detail-card reveal"
                key={i}
                style={{ cursor: "pointer" }}
                onClick={() => onNavigate(`/services/${s.slug}`)}
              >
                <div className="service-detail-icon">
                  <i className={`fas ${s.icon}`}></i>
                  {s.visual === "growth" && (
                    <div className="growth-visual">
                      <div
                        className="bar growth-bar"
                        style={{ ["--bar-h" as string]: "40px" }}
                      ></div>
                      <div
                        className="bar growth-bar"
                        style={{
                          ["--bar-h" as string]: "60px",
                          animationDelay: "0.1s",
                        }}
                      ></div>
                      <div
                        className="bar growth-bar"
                        style={{
                          ["--bar-h" as string]: "50px",
                          animationDelay: "0.2s",
                        }}
                      ></div>
                      <div
                        className="bar growth-bar"
                        style={{
                          ["--bar-h" as string]: "80px",
                          animationDelay: "0.3s",
                        }}
                      ></div>
                      <div
                        className="bar growth-bar"
                        style={{
                          ["--bar-h" as string]: "70px",
                          animationDelay: "0.4s",
                        }}
                      ></div>
                      <div
                        className="bar growth-bar"
                        style={{
                          ["--bar-h" as string]: "100px",
                          animationDelay: "0.5s",
                        }}
                      ></div>
                      <div
                        className="bar growth-bar"
                        style={{
                          ["--bar-h" as string]: "120px",
                          animationDelay: "0.6s",
                        }}
                      ></div>
                    </div>
                  )}
                  {s.visual === "social" && (
                    <div className="social-cluster">
                      <div className="s-icon fb bounce-hover">
                        <i className="fab fa-facebook-f"></i>
                      </div>
                      <div className="s-icon ig bounce-hover">
                        <i className="fab fa-instagram"></i>
                      </div>
                      <div className="s-icon tw bounce-hover">
                        <i className="fab fa-twitter"></i>
                      </div>
                      <div className="s-icon li bounce-hover">
                        <i className="fab fa-linkedin-in"></i>
                      </div>
                      <div className="s-icon tk bounce-hover">
                        <i className="fab fa-tiktok"></i>
                      </div>
                      <div className="s-icon yt bounce-hover">
                        <i className="fab fa-youtube"></i>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{
                      marginTop: "12px",
                      padding: "8px 18px",
                      fontSize: "0.85rem",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`/services/${s.slug}`);
                    }}
                  >
                    <i className="fas fa-arrow-right"></i> View Features
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Let&apos;s Build Something Amazing Together</h2>
          <p>
            Get a free consultation and discover how our services can transform
            your business.
          </p>
          <a
            href="#/contact"
            className="btn btn-primary btn-pulse"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("/contact");
            }}
          >
            <i className="fas fa-arrow-right"></i> Order Now
          </a>
        </div>
      </section>
    </>
  );
}
