"use client";

import { useState, useRef } from "react";
import { useScrollReveal } from "../useScrollReveal";

const serviceOptions = [
  { value: "web-design", label: "Website Design & Dev" },
  { value: "app-dev", label: "App Development" },
  { value: "saas", label: "SaaS Solutions" },
  { value: "marketing", label: "Digital Marketing & Ads" },
  { value: "social", label: "Social Media Management" },
  { value: "seo", label: "SEO Optimization" },
  { value: "chat", label: "AI Chat Support" },
  { value: "branding", label: "Branding & UI/UX" },
  { value: "maintenance", label: "Ongoing Maintenance" },
];

const businessTypes = [
  { value: "retail", label: "Retail / E-commerce" },
  { value: "food", label: "Food & Restaurant" },
  { value: "professional", label: "Professional Services" },
  { value: "health", label: "Health & Fitness" },
  { value: "real-estate", label: "Real Estate" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

export function ContactPage() {
  useScrollReveal();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const toggleService = (value: string, label: string) => {
    setSelectedServices((prev) => {
      const exists = prev.includes(value);
      return exists ? prev.filter((s) => s !== value) : [...prev, value];
    });
  };

  const triggerText =
    selectedServices.length > 0
      ? serviceOptions
          .filter((o) => selectedServices.includes(o.value))
          .map((o) => o.label)
          .join(", ")
      : "Select services...";

  const bizTriggerText = selectedBiz
    ? businessTypes.find((b) => b.value === selectedBiz)?.label || "Select your industry..."
    : "Select your industry...";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const msg = (formData.get("message") as string)?.trim();

    // Validate
    const errors: Record<string, boolean> = {};
    if (!name) errors.name = true;
    if (!email) errors.email = true;
    if (!msg) errors.message = true;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const orderData = {
        client_name: name,
        client_email: email,
        invite_code: null,
        status: "pending",
        business_type: selectedBiz || null,
        services: selectedServices.join(","),
        budget: (formData.get("budget") as string) || null,
        message: msg,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Failed to submit order");

      // Send email to admin with full form details
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            businessType: selectedBiz,
            services: selectedServices.join(","),
            budget: (formData.get("budget") as string) || "",
            message: msg,
          }),
        });
      } catch (emailErr) {
        console.warn("Email send failed (order still saved):", emailErr);
      }

      setSuccess(true);
      setTimeout(() => {
        if (success) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      console.error("FAILED...", error);
      alert("Oops! Failed to send message or log order. Please try again later.");
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
            style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}
          >
            <i
              className="fas fa-check-circle"
              style={{
                fontSize: "3rem",
                color: "var(--primary)",
                marginBottom: "16px",
                display: "block",
              }}
            ></i>
            <h1 style={{ marginBottom: "8px" }}>Message Sent!</h1>
            <p style={{ color: "var(--text-muted)" }}>
              Thank you for reaching out. We&apos;ll get back to you as soon as
              possible!
            </p>
          </div>
        </div>
      </section>
    );
  }

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
              <i className="fas fa-bolt"></i> Boost Your Business
            </div>
            <h1>
              <span className="gradient-text">Select Service</span>
              <br />
              You Want
            </h1>
            <p className="hero-sub">
              Provide the details of service you want and requirements below.
              We&apos;ll review the submission and reach out within 24 hours to
              get started.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form reveal-left">
              <h3 style={{ marginBottom: "24px", fontSize: "1.3rem" }}>
                Project Submission Form
              </h3>
              <form ref={formRef} onSubmit={handleSubmit}>
                <input
                  type="hidden"
                  name="_subject"
                  value="New Submission from ElevateEdge Contact Form"
                />
                <div className="form-group">
                  <label htmlFor="c-name">Your Name</label>
                  <input
                    type="text"
                    id="c-name"
                    name="name"
                    placeholder="John Doe"
                    required
                    style={fieldErrors.name ? { borderColor: "#e74c3c" } : {}}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-email">Email Address</label>
                  <input
                    type="email"
                    id="c-email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    style={fieldErrors.email ? { borderColor: "#e74c3c" } : {}}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-biz">Business Type</label>
                  <div
                    className={`custom-multi-select ${
                      bizDropdownOpen ? "active" : ""
                    }`}
                    id="biz-dropdown"
                  >
                    <div
                      className="select-trigger"
                      id="biz-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBizDropdownOpen(!bizDropdownOpen);
                      }}
                    >
                      <span className="trigger-text">{bizTriggerText}</span>
                    </div>
                    {bizDropdownOpen && (
                      <div className="options-container" id="biz-options">
                        {businessTypes.map((opt) => (
                          <div
                            key={opt.value}
                            className={`option ${
                              selectedBiz === opt.value ? "selected" : ""
                            }`}
                            data-value={opt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBiz(opt.value);
                              setBizDropdownOpen(false);
                            }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="c-services">Services Required</label>
                  <div
                    className={`custom-multi-select ${
                      dropdownOpen ? "active" : ""
                    }`}
                    id="services-dropdown"
                  >
                    <div
                      className="select-trigger"
                      id="services-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(!dropdownOpen);
                      }}
                    >
                      <span className="trigger-text">{triggerText}</span>
                    </div>
                    {dropdownOpen && (
                      <div className="options-container" id="services-options">
                        {serviceOptions.map((opt) => (
                          <div
                            key={opt.value}
                            className={`option ${
                              selectedServices.includes(opt.value)
                                ? "selected"
                                : ""
                            }`}
                            data-value={opt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(opt.value, opt.label);
                            }}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="c-budget">
                    Estimated Budget for Your Business
                  </label>
                  <input
                    type="text"
                    id="c-budget"
                    name="budget"
                    placeholder="e.g. £150 - £1,000"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-msg">
                    Service Description &amp; Requirements (Provide WhatsApp for
                    detailed meeting)
                  </label>
                  <textarea
                    id="c-msg"
                    name="message"
                    placeholder="Tell us about the project goals, requirements, or any specific instructions..."
                    required
                    rows={5}
                    style={
                      fieldErrors.message
                        ? { borderColor: "#e74c3c" }
                        : {}
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-pulse form-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt"></i> Order
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="contact-info reveal-right">
              <a
                href="https://wa.me/923110523073"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card whatsapp-card"
                style={{ textDecoration: "none" }}
              >
                <div className="icon-box">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <div>
                  <h4>Chat with us on WhatsApp!</h4>
                  <p>
                    +92 311 0523073
                    <br />
                    <span style={{ fontSize: "0.82rem", opacity: 0.7 }}>
                      Tap to open WhatsApp
                    </span>
                  </p>
                </div>
              </a>
              <div className="contact-card">
                <div className="icon-box">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <h4>Business Hours</h4>
                  <p>
                    24/7 Available
                    <br />
                    <span style={{ fontSize: "0.82rem", opacity: 0.7 }}>
                      We&apos;re always here for you
                    </span>
                  </p>
                </div>
              </div>
              <div className="contact-card">
                <div className="icon-box">
                  <i className="fas fa-globe"></i>
                </div>
                <div>
                  <h4>We Work Globally</h4>
                  <p>
                    Serving clients worldwide
                    <br />
                    <span style={{ fontSize: "0.82rem", opacity: 0.7 }}>
                      Remote-first, available everywhere
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container reveal">
          <h2>Ready to Elevate Your Business?</h2>
          <p>Contact us today and let&apos;s make your vision a reality.</p>
          <a
            href="https://wa.me/923110523073"
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
