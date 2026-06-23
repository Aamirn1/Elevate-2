"use client";

import { useState, useRef } from "react";
import { useScrollReveal } from "../useScrollReveal";

interface PricingPageProps {
  onNavigate: (path: string) => void;
}

type Feature = {
  label: string;
  included: boolean;
};

type Package = {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  currency: string;
  amount: string;
  period: string;
  features: Feature[];
  featured?: boolean;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaIsAnchor?: boolean;
  whatsappLink?: string;
};

const packages: Package[] = [
  {
    id: "standard",
    icon: "fa-rocket",
    name: "Standard Package",
    tagline:
      "Perfect for small businesses and startups looking to establish their online presence with a clean, professional website.",
    currency: "PKR",
    amount: "25k",
    period: "One-time project fee",
    features: [
      { label: "Professional website design", included: true },
      { label: "2-3 pages", included: true },
      { label: "WhatsApp redirect for checkout", included: true },
      { label: "Mobile responsive", included: true },
      { label: "Basic SEO", included: true },
      { label: "Social media links", included: true },
      { label: "Fast loading", included: true },
      { label: "Admin panel", included: false },
      { label: "User & order management", included: false },
    ],
    ctaLabel: "Get Started",
    ctaHref: "/contact",
    whatsappLink: `https://wa.me/923110523073?text=${encodeURIComponent(
      "New Order - ElevateEdge Digital\n\nPackage: Standard Package\nPrice: PKR 25k\nPeriod: One-time project fee\n\nI'm interested in this package. Please share more details."
    )}`,
  },
  {
    id: "professional",
    icon: "fa-crown",
    name: "Professional Package",
    tagline:
      "Our most popular package for growing businesses that need a full-featured, database-driven platform with admin controls.",
    currency: "PKR",
    amount: "40k",
    period: "One-time project fee",
    featured: true,
    badge: "Most Popular",
    features: [
      { label: "Everything in Standard", included: true },
      { label: "Multiple pages (unlimited)", included: true },
      { label: "Admin panel dashboard", included: true },
      { label: "User management", included: true },
      { label: "Order management", included: true },
      { label: "Database connected", included: true },
      { label: "Secure authentication", included: true },
      { label: "Payment integration", included: true },
      { label: "Analytics", included: true },
    ],
    ctaLabel: "Get Started",
    ctaHref: "/contact",
    whatsappLink: `https://wa.me/923110523073?text=${encodeURIComponent(
      "New Order - ElevateEdge Digital\n\nPackage: Professional Package\nPrice: PKR 40k\nPeriod: One-time project fee\n\nI'm interested in this package. Please share more details."
    )}`,
  },
  {
    id: "custom",
    icon: "fa-gem",
    name: "Custom Package",
    tagline:
      "Tailored solutions for enterprises and unique visions — build exactly what you need with full flexibility and support.",
    currency: "",
    amount: "Custom",
    period: "Quote based on requirements",
    features: [
      { label: "Fully customized features", included: true },
      { label: "Flexible page count", included: true },
      { label: "Custom integrations", included: true },
      { label: "Dedicated project manager", included: true },
      { label: "Priority support", included: true },
      { label: "Scalable architecture", included: true },
      { label: "Source code ownership", included: true },
      { label: "Free revisions", included: true },
      { label: "Ongoing maintenance", included: true },
    ],
    ctaLabel: "Request Custom Quote",
    ctaHref: "#custom-package",
    ctaIsAnchor: true,
  },
];

const includedServices = [
  {
    icon: "fa-mobile-alt",
    title: "Mobile-First Design",
    desc: "Every site we build is crafted mobile-first, ensuring pixel-perfect, fluid experiences on phones, tablets, and desktops alike.",
  },
  {
    icon: "fa-bolt",
    title: "Fast Delivery",
    desc: "We move fast without cutting corners — most projects ship within agreed timelines, with weekly progress updates throughout.",
  },
  {
    icon: "fa-shield-halved",
    title: "Secure & Reliable",
    desc: "SSL, encrypted auth, and best-practice hardening baked in. Your business stays protected and your users stay safe.",
  },
  {
    icon: "fa-headset",
    title: "Dedicated Support",
    desc: "A real, responsive team that listens and stays with you long after launch. We grow alongside your business.",
  },
  {
    icon: "fa-arrows-rotate",
    title: "Free Revisions",
    desc: "We refine until it feels right. Every package includes revision rounds so the final product matches your vision.",
  },
  {
    icon: "fa-layer-group",
    title: "Modern Tech Stack",
    desc: "Next.js, TypeScript, Prisma, and Tailwind — modern, scalable foundations that are fast, maintainable, and future-proof.",
  },
];

const customFeatures = [
  "Website Design",
  "E-commerce Store",
  "Admin Panel",
  "Database Integration",
  "User Authentication",
  "Payment Gateway",
  "API Development",
  "Mobile App",
  "SEO Optimization",
  "Digital Marketing",
  "Social Media Management",
  "AI Chatbot",
  "WhatsApp Integration",
  "Multi-language Support",
];

const timelineOptions = [
  { value: "asap", label: "ASAP (Rush)" },
  { value: "1-2-weeks", label: "1 - 2 Weeks" },
  { value: "3-4-weeks", label: "3 - 4 Weeks" },
  { value: "1-2-months", label: "1 - 2 Months" },
  { value: "3+months", label: "3+ Months" },
  { value: "flexible", label: "Flexible / Not Sure" },
];

const faqs = [
  {
    icon: "fa-circle-question",
    q: "What's the difference between the Standard and Professional packages?",
    a: "The Standard package is a static, multi-page informational site with WhatsApp checkout redirects — perfect for establishing an online presence. The Professional package adds a full admin dashboard, user and order management, a connected database, secure authentication, payment integration, and analytics — ideal for businesses that need to manage operations online.",
  },
  {
    icon: "fa-clock",
    q: "How long does a typical project take?",
    a: "Standard packages usually take 5–10 business days, while Professional packages take 2–4 weeks depending on complexity. Custom projects vary based on scope, but we always agree on a clear timeline upfront and provide weekly progress updates so you're never in the dark.",
  },
  {
    icon: "fa-money-bill-wave",
    q: "Do you require payment upfront?",
    a: "We typically work on a 50% advance / 50% on delivery model. For larger custom projects, we can split payments into milestones tied to deliverables. This keeps things fair, transparent, and low-risk for both sides.",
  },
  {
    icon: "fa-code",
    q: "Do I own the source code?",
    a: "Yes — especially with the Custom package, you receive full source code ownership. For Standard and Professional packages, you own the deployed project and all final assets. We retain rights only to reusable internal libraries.",
  },
  {
    icon: "fa-pen-ruler",
    q: "How many revisions are included?",
    a: "Every package includes free revision rounds during the design and development phases. Standard includes 2 rounds, Professional includes 4 rounds, and Custom packages offer unlimited revisions during active sprints. Additional post-launch changes can be handled via a maintenance plan.",
  },
  {
    icon: "fa-handshake",
    q: "What if I'm not sure which package fits my business?",
    a: "No problem! Reach out via WhatsApp or fill out the Custom Package form above with your goals and budget. We'll review your requirements and recommend the most cost-effective package for your needs — no pressure, no obligation.",
  },
];

export function PricingPage({ onNavigate }: PricingPageProps) {
  useScrollReveal();

  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const scrollToCustomPackage = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("custom-package");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const budget = (formData.get("budget") as string)?.trim();
    const timelineRaw = (formData.get("timeline") as string) || "";
    const timelineLabel =
      timelineOptions.find((t) => t.value === timelineRaw)?.label || timelineRaw;
    const details = (formData.get("details") as string)?.trim();

    // Validation
    const errors: Record<string, boolean> = {};
    if (!name) errors.name = true;
    if (!email) errors.email = true;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = true;
    if (!details) errors.details = true;
    if (selectedFeatures.length === 0) errors.features = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const composedMessage =
        `--- Custom Package Request ---\n` +
        `Selected Features: ${
          selectedFeatures.length > 0 ? selectedFeatures.join(", ") : "None"
        }\n` +
        `Budget: ${budget || "Not specified"}\n` +
        `Timeline: ${timelineLabel || "Not specified"}\n\n` +
        `Project Details:\n${details}`;

      const orderData = {
        client_name: name,
        client_email: email,
        invite_code: null,
        status: "pending",
        business_type: "custom-package",
        services: selectedFeatures.join(","),
        budget: budget || null,
        message: composedMessage,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Failed to submit order");
      setSuccess(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("FAILED...", error);
      alert(
        "Oops! Failed to submit your custom package request. Please try again later or reach us on WhatsApp."
      );
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section
        className="hero"
        style={{ minHeight: "70vh", padding: "160px 0 60px" }}
      >
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="container">
          <div
            className="hero-content"
            style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto" }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize: "3.5rem",
                color: "var(--primary)",
                marginBottom: "20px",
                display: "block",
              }}
            ></i>
            <h1 style={{ marginBottom: "12px" }}>Request Received!</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
              Thank you for your interest in a Custom Package. Our team will
              review your requirements and reach out within 24 hours with a
              tailored proposal.
            </p>
            <div
              style={{
                marginTop: "32px",
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href="https://wa.me/923205719979"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-pulse"
                style={{ background: "#25D366" }}
              >
                <i className="fab fa-whatsapp"></i> Chat on WhatsApp
              </a>
              <a
                href="#/"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("/");
                }}
              >
                <i className="fas fa-home"></i> Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
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
              <i className="fas fa-tag"></i> Our Pricing
            </div>
            <h1>
              <span className="gradient-text">Transparent Pricing</span>
              <br />
              for Every Business
            </h1>
            <p className="hero-sub">
              No hidden fees, no surprises. Pick a package that fits your goals
              today, and scale effortlessly as your business grows.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>
              Choose Your <span className="gradient-text">Package</span>
            </h2>
            <p>
              Three flexible options designed for businesses at every stage —
              from first website to full custom platform.
            </p>
          </div>
          <div className="pricing-grid">
            {packages.map((pkg, i) => (
              <div
                className={`pricing-card reveal${pkg.featured ? " featured" : ""}`}
                key={pkg.id}
                style={{
                  transitionDelay: `${i * 80}ms`,
                  marginTop: pkg.featured ? "0px" : undefined,
                }}
              >
                {pkg.badge && <div className="pricing-badge">{pkg.badge}</div>}
                <div className="pricing-icon">
                  <i className={`fas ${pkg.icon}`}></i>
                </div>
                <h3>{pkg.name}</h3>
                <p className="pricing-tagline">{pkg.tagline}</p>
                <div className="pricing-price">
                  {pkg.currency && (
                    <span className="currency">{pkg.currency}</span>
                  )}
                  <span className="amount">{pkg.amount}</span>
                  <span className="period">{pkg.period}</span>
                </div>
                <ul className="pricing-features">
                  {pkg.features.map((f, j) => (
                    <li
                      key={j}
                      className={f.included ? "" : "disabled"}
                    >
                      <i
                        className={`fas ${f.included ? "fa-check-circle" : "fa-times-circle"}`}
                      ></i>
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
                {pkg.ctaIsAnchor ? (
                  <a
                    href={pkg.ctaHref}
                    className="btn btn-outline pricing-cta"
                    onClick={scrollToCustomPackage}
                  >
                    <i className="fas fa-arrow-right"></i> {pkg.ctaLabel}
                  </a>
                ) : pkg.whatsappLink ? (
                  <a
                    href={pkg.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn pricing-cta ${
                      pkg.featured ? "btn-primary btn-pulse" : "btn-outline"
                    }`}
                    style={
                      pkg.featured
                        ? { background: "#25D366", color: "#fff" }
                        : undefined
                    }
                  >
                    <i className="fab fa-whatsapp"></i> {pkg.ctaLabel}
                  </a>
                ) : (
                  <a
                    href={`#${pkg.ctaHref}`}
                    className={`btn pricing-cta ${
                      pkg.featured ? "btn-primary btn-pulse" : "btn-outline"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(pkg.ctaHref);
                    }}
                  >
                    <i className="fas fa-arrow-right"></i> {pkg.ctaLabel}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="services-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>
              What&apos;s <span className="gradient-text">Included?</span>
            </h2>
            <p>
              Every package — Standard, Professional, or Custom — comes packed
              with these essentials to ensure your project succeeds.
            </p>
          </div>
          <div className="services-grid">
            {includedServices.map((s, i) => (
              <div
                className="service-card reveal"
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="service-icon">
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Package Form */}
      <section
        className="custom-package-section"
        id="custom-package"
      >
        <div className="container">
          <div className="section-header reveal">
            <h2>
              Build Your <span className="gradient-text">Custom Package</span>
            </h2>
            <p>
              Select the features you need, share your budget and timeline, and
              our team will craft a tailored proposal just for you.
            </p>
          </div>

          <div className="custom-package-card reveal">
            <form ref={formRef} onSubmit={handleSubmit} noValidate>
              {/* Feature chips */}
              <div className="form-group">
                <label
                  htmlFor="features-chips"
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    color: "var(--text)",
                    fontWeight: 600,
                  }}
                >
                  Select Features{" "}
                  <span style={{ color: "var(--primary)" }}>*</span>
                </label>
                <div className="feature-chips" id="features-chips">
                  {customFeatures.map((feature) => {
                    const selected = selectedFeatures.includes(feature);
                    return (
                      <div
                        key={feature}
                        className={`feature-chip${selected ? " selected" : ""}`}
                        onClick={() => toggleFeature(feature)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleFeature(feature);
                          }
                        }}
                      >
                        <i
                          className={`fas ${selected ? "fa-check" : "fa-plus"}`}
                        ></i>
                        {feature}
                      </div>
                    );
                  })}
                </div>
                {fieldErrors.features && (
                  <p
                    style={{
                      color: "#e74c3c",
                      fontSize: "0.8rem",
                      marginTop: "8px",
                    }}
                  >
                    Please select at least one feature.
                  </p>
                )}
              </div>

              {/* Name + Email row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <div className="form-group">
                  <label htmlFor="cp-name">Your Name</label>
                  <input
                    type="text"
                    id="cp-name"
                    name="name"
                    placeholder="John Doe"
                    style={
                      fieldErrors.name ? { borderColor: "#e74c3c" } : {}
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cp-email">Email Address</label>
                  <input
                    type="email"
                    id="cp-email"
                    name="email"
                    placeholder="john@example.com"
                    style={
                      fieldErrors.email ? { borderColor: "#e74c3c" } : {}
                    }
                  />
                </div>
              </div>

              {/* Budget + Timeline row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <div className="form-group">
                  <label htmlFor="cp-budget">
                    Estimated Budget{" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="cp-budget"
                    name="budget"
                    placeholder="e.g. 60k - 80k PKR"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cp-timeline">Project Timeline</label>
                  <select id="cp-timeline" name="timeline" defaultValue="">
                    <option value="" disabled>
                      Select timeline...
                    </option>
                    {timelineOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project details */}
              <div className="form-group">
                <label htmlFor="cp-details">
                  Project Details{" "}
                  <span style={{ color: "var(--primary)" }}>*</span>
                </label>
                <textarea
                  id="cp-details"
                  name="details"
                  rows={5}
                  placeholder="Describe your project goals, target audience, reference websites, must-have features, or any specific instructions..."
                  style={
                    fieldErrors.details ? { borderColor: "#e74c3c" } : {}
                  }
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-pulse form-submit"
                disabled={submitting}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Request Custom Quote
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="why-us-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p>
              Everything you need to know about our packages, process, and
              policies. Still curious? Reach out anytime.
            </p>
          </div>
          <div className="why-us-grid">
            {faqs.map((faq, i) => (
              <div
                className="why-us-card reveal"
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="why-us-icon">
                  <i className={`fas ${faq.icon}`}></i>
                </div>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Still Deciding? Let&apos;s Talk.</h2>
          <p>
            Chat with our team on WhatsApp for a free consultation — we&apos;ll
            help you pick the perfect package for your business goals.
          </p>
          <a
            href="https://wa.me/923205719979"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-pulse"
            style={{ background: "#25D366" }}
          >
            <i className="fab fa-whatsapp"></i> Message Us on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
