"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  url: string;
  sortOrder: number | null;
}

interface HomePageProps {
  onNavigate: (path: string) => void;
}

function formatDesc5Words(desc: string) {
  if (!desc) return "";
  const words = desc.split(" ");
  const result: string[] = [];
  for (let i = 0; i < words.length; i++) {
    result.push(words[i]);
    if ((i + 1) % 5 === 0) {
      result.push("\n");
    }
  }
  return result.join(" ");
}

export function HomePage({ onNavigate }: HomePageProps) {
  useScrollReveal();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate hero stats counter
  useEffect(() => {
    const nums = document.querySelectorAll<HTMLElement>(".hero-stat .num");
    nums.forEach((num) => {
      const target = parseInt(num.getAttribute("data-target") || "0", 10);
      if (!target) return;
      const suffix = num.textContent?.replace(/[0-9]/g, "") || "";
      let current = 0;
      const increment = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        num.textContent = current + suffix;
      }, 30);
    });
  }, []);

  // Fetch projects
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProjects(data);
      })
      .catch((err) => console.warn("Failed to fetch projects", err));
  }, []);

  const total = projects.length;

  const goToSlide = (n: number) => {
    if (total === 0) return;
    setCurrentSlide(((n % total) + total) % total);
  };

  // Auto-slide
  useEffect(() => {
    if (total === 0) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 6000);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [total]);

  const pauseAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  };
  const resumeAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 6000);
  };

  // Touch swipe
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    pauseAutoSlide();
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
    }
    resumeAutoSlide();
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-rocket"></i>
              <span>Amplify Your Business Growth Online</span>
            </div>
            <h1>
              <span
                style={{
                  display: "inline-block",
                  color: "var(--primary)",
                  textShadow: "0 0 30px rgba(168, 85, 247, 0.5)",
                }}
              >
                Double Your
              </span>
              <br />
              <span style={{ display: "inline-block" }}>Business Growth</span>
            </h1>
            <p className="hero-sub">
              Affordable Web Design, Digital Ads &amp; Social Media Management
              to Propel Your Success. Get 2&times; the growth with our
              budget-friendly digital solutions.
            </p>
            <div className="hero-btns">
              <a
                href="#/contact"
                className="btn btn-primary btn-pulse"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("/contact");
                }}
              >
                <i className="fas fa-bolt"></i> Get Started
              </a>
              <a
                href="#/pricing"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("/pricing");
                }}
              >
                <i className="fas fa-tags"></i> View Pricing
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num" data-target="150">
                  0+
                </div>
                <div className="label">Projects Delivered</div>
              </div>
              <div className="hero-stat">
                <div className="num" data-target="98">
                  0%
                </div>
                <div className="label">Client Satisfaction</div>
              </div>
              <div className="hero-stat">
                <div className="num" data-target="50">
                  0+
                </div>
                <div className="label">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator" aria-hidden="true">
          <div className="mouse"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* Agency Trust Bar */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-bar-inner">
            <div className="trust-item">
              <i className="fas fa-globe"></i>
              <span>{"Web Design\u00A0& Development"}</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <i className="fas fa-mobile-alt"></i>
              <span>Mobile App Development</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <i className="fas fa-cogs"></i>
              <span>SaaS Solutions</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <i className="fas fa-hashtag"></i>
              <span>Social Media Management</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <i className="fas fa-bullhorn"></i>
              <span>Digital Marketing &amp; Ads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>What We Do Best</h2>
            <p>
              Comprehensive digital solutions designed to accelerate your
              business growth — all within your budget.
            </p>
          </div>
          <div className="services-grid">
            {[
              {
                slug: "web-development",
                icon: "fa-code",
                title: "Custom Website Development",
                desc: "Responsive, modern websites tailored to your industry with animated visuals and mobile-friendly layouts.",
                items: [
                  "Multi-page responsive designs",
                  "Modern UI/UX principles",
                  "SEO optimized",
                ],
              },
              {
                slug: "digital-marketing",
                icon: "fa-chart-line",
                title: "Digital Marketing & Ads",
                desc: "Data-driven campaigns on Google Ads, Facebook & Instagram to maximize your ROI with targeted strategies.",
                items: [
                  "Google & Social Ads",
                  "Budget-friendly packages",
                  "Measurable results",
                ],
              },
              {
                slug: "social-media",
                icon: "fa-share-alt",
                title: "Social Media Management",
                desc: "Content calendars, engaging graphics, and strategic postings to grow your audience and build your brand.",
                items: [
                  "Content creation & scheduling",
                  "Community engagement",
                  "Analytics & reporting",
                ],
              },
              {
                slug: "app-development",
                icon: "fa-mobile-alt",
                title: "App Development",
                desc: "Premium mobile applications for iOS & Android built for performance and user engagement.",
                items: [
                  "Native-like Experience",
                  "Custom UI/UX Design",
                  "Cross-platform Growth",
                ],
              },
              {
                slug: "saas-solutions",
                icon: "fa-cogs",
                title: "SaaS Solutions",
                desc: "Custom cloud-based business software designed to automate and scale your operations.",
                items: [
                  "Workflow Automation",
                  "Scalable Infrastructure",
                  "Data Management",
                ],
              },
              {
                slug: "virtual-assistant",
                icon: "fa-headset",
                title: "Virtual Assistant Service",
                desc: "A dedicated virtual assistant service to manage daily business operations and handle client queries efficiently.",
                items: [
                  "Business admin support",
                  "Client query handling",
                  "Daily reporting",
                ],
              },
            ].map((s, i) => (
              <div
                className="service-card reveal"
                key={i}
                style={{ cursor: "pointer" }}
                onClick={() => onNavigate(`/services/${s.slug}`)}
              >
                <div className="service-icon">
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul>
                  {s.items.map((item, j) => (
                    <li key={j}>
                      <i className="fas fa-check-circle"></i> {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={`#/services/${s.slug}`}
                  className="btn btn-outline"
                  style={{
                    marginTop: "12px",
                    padding: "8px 18px",
                    fontSize: "0.85rem",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate(`/services/${s.slug}`);
                  }}
                >
                  <i className="fas fa-arrow-right"></i> Learn More
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>
              Why Choose <span className="gradient-text">ElevateEdge?</span>
            </h2>
            <p>
              We&apos;re not just an agency — we&apos;re your dedicated digital
              growth partner.
            </p>
          </div>
          <div className="why-us-grid">
            {[
              {
                icon: "fa-dollar-sign",
                title: "Affordable Pricing",
                desc: "Premium digital services at prices that work for startups, SMEs, and growing businesses. No hidden fees, ever.",
              },
              {
                icon: "fa-tachometer-alt",
                title: "Fast Turnaround",
                desc: "We deliver your website or campaign in record time without compromising on quality or attention to detail.",
              },
              {
                icon: "fa-chart-bar",
                title: "Results-Driven",
                desc: "Every strategy we build is focused on measurable outcomes — more leads, more traffic, more revenue for you.",
              },
              {
                icon: "fa-users",
                title: "Dedicated Support",
                desc: "A real team that listens, communicates, and stays with you long after launch. We grow as your business grows.",
              },
              {
                icon: "fa-mobile-alt",
                title: "Mobile-First Design",
                desc: "All our websites are built mobile-first, ensuring a flawless experience on every screen size and device.",
              },
              {
                icon: "fa-lock",
                title: "Secure & Reliable",
                desc: "SSL, fast hosting, and best-practice security baked into every project so your business stays protected.",
              },
            ].map((w, i) => (
              <div className="why-us-card reveal" key={i}>
                <div className="why-us-icon">
                  <i className={`fas ${w.icon}`}></i>
                </div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="process-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>
              How We <span className="gradient-text">Work</span>
            </h2>
            <p>A simple, transparent process designed to get you results fast.</p>
          </div>
          <div className="process-steps reveal">
            {[
              {
                num: "01",
                title: "Discovery Call",
                desc: "We start with a free consultation to understand your business, goals, and target audience.",
              },
              {
                num: "02",
                title: "Strategy & Design",
                desc: "Our team crafts a tailored digital strategy and presents design concepts for your approval.",
              },
              {
                num: "03",
                title: "Build & Launch",
                desc: "We develop, test, and launch your website or campaign with precision and speed.",
              },
              {
                num: "04",
                title: "Grow & Optimize",
                desc: "We monitor performance, run optimizations, and keep your digital presence ahead of the competition.",
              },
            ].map((step, i) => (
              <div key={i}>
                <div className="process-step reveal">
                  <div className="step-number">{step.num}</div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
                {i < 3 && <div className="process-connector reveal"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="portfolio-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>Featured Projects</h2>
            <p>
              A glimpse into the digital experiences we&apos;ve crafted for our
              clients.
            </p>
          </div>

          <div className="portfolio-slider">
            <div
              className="portfolio-track"
              id="home-portfolio-track"
              ref={trackRef}
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
              onMouseEnter={pauseAutoSlide}
              onMouseLeave={resumeAutoSlide}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {projects.map((p) => (
                <div className="portfolio-slide" key={p.id}>
                  <div className="slide-img">
                    <img src={p.image} alt={p.title} loading="lazy" />
                  </div>
                  <div className="slide-info">
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "12px",
                      }}
                    >
                      {(p.tags || []).map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "rgba(168, 85, 247,0.12)",
                            color: "var(--primary-light)",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3>{p.title}</h3>
                    <p style={{ whiteSpace: "pre-line" }}>
                      {formatDesc5Words(p.description)}
                    </p>
                    {p.url && p.url !== "#" && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ marginTop: "8px" }}
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

          <div className="slider-controls reveal">
            <button
              className="slider-btn"
              aria-label="Previous"
              onClick={() => {
                goToSlide(currentSlide - 1);
                pauseAutoSlide();
                setTimeout(resumeAutoSlide, 5000);
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="slider-dots" id="home-slider-dots">
              {projects.map((_, i) => (
                <button
                  key={i}
                  className={`slider-dot ${i === currentSlide ? "active" : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => {
                    goToSlide(i);
                    pauseAutoSlide();
                    setTimeout(resumeAutoSlide, 5000);
                  }}
                ></button>
              ))}
            </div>
            <button
              className="slider-btn"
              aria-label="Next"
              onClick={() => {
                goToSlide(currentSlide + 1);
                pauseAutoSlide();
                setTimeout(resumeAutoSlide, 5000);
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Ready to Elevate Your Business?</h2>
          <p>Contact us today and let&apos;s build something amazing together.</p>
          <a
            href="#/contact"
            className="btn btn-primary btn-pulse"
            style={{ marginTop: "8px" }}
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
