"use client";

import { useScrollReveal } from "../useScrollReveal";

interface CareerPageProps {
  onNavigate: (path: string) => void;
}

export function CareerPage({ onNavigate }: CareerPageProps) {
  useScrollReveal();

  const responsibilities = [
    "Respond to customer inquiries via WhatsApp, email, and chat in a timely and professional manner",
    "Provide accurate information about our services, packages, and pricing to potential clients",
    "Resolve customer complaints and escalations with empathy and effective problem-solving",
    "Maintain detailed records of customer interactions and follow up to ensure satisfaction",
  ];

  const requirements = [
    "Excellent written and verbal communication skills in English and Urdu",
    "Prior experience in customer service, support, or a related role is preferred",
    "Strong problem-solving skills with a customer-first mindset",
    "Reliable internet connection and ability to work flexible hours from a remote setup",
  ];

  const perks = [
    {
      icon: "fa-sack-dollar",
      title: "Competitive Compensation",
      desc: "We offer industry-aligned salaries with performance-based bonuses and incentives that reward your hard work.",
    },
    {
      icon: "fa-chart-line",
      title: "Growth Opportunities",
      desc: "Clear career progression paths, mentorship, and the chance to take on leadership roles as we scale.",
    },
    {
      icon: "fa-laptop-house",
      title: "Flexible Work Environment",
      desc: "Work remotely from anywhere with flexible hours that help you balance your personal and professional life.",
    },
    {
      icon: "fa-graduation-cap",
      title: "Skill Development",
      desc: "Access to training programs, courses, and hands-on experience with the latest tools and technologies.",
    },
  ];

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
              <i className="fas fa-users"></i> Join Our Team
            </div>
            <h1>
              <span className="gradient-text">Build Your Career</span>
              <br />
              With ElevateEdge
            </h1>
            <p className="hero-sub">
              We&apos;re looking for passionate, driven individuals who want to
              grow with a fast-moving digital agency. Explore our open roles and
              take the next step in your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Job Posting */}
      <section className="services-section">
        <div className="container">
          <div
            className="value-card reveal"
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              padding: "36px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(236, 72, 153, 0.18))",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <i
                  className="fas fa-headset"
                  style={{
                    fontSize: "2.2rem",
                    color: "var(--primary)",
                  }}
                ></i>
              </div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "20px",
                  color: "var(--text)",
                }}
              >
                Customer Service Representative (CSR)
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 14px",
                    borderRadius: "999px",
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    color: "var(--primary-light)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  <i className="fas fa-briefcase" style={{ lineHeight: 1 }}></i> Full-time
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 14px",
                    borderRadius: "999px",
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    color: "var(--primary-light)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  <i className="fas fa-location-dot" style={{ lineHeight: 1 }}></i> Remote
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 14px",
                    borderRadius: "999px",
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.25)",
                    color: "var(--primary-light)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                  }}
                >
                  <i className="fas fa-clock" style={{ lineHeight: 1 }}></i> Flexible Hours
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: "28px",
              }}
            >
              We are looking for a friendly and dedicated Customer Service
              Representative to join our growing team. In this role, you will be
              the first point of contact for our clients, helping them navigate
              our digital services, answering their questions, and ensuring a
              seamless experience from inquiry to delivery. If you love helping
              people and thrive in a fast-paced, remote-first environment,
              we&apos;d love to hear from you.
            </p>

            {/* Responsibilities */}
            <div style={{ marginBottom: "28px" }}>
              <h4
                style={{
                  fontSize: "1.15rem",
                  marginBottom: "14px",
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <i
                  className="fas fa-list-check"
                  style={{ color: "var(--primary)" }}
                ></i>
                Key Responsibilities
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {responsibilities.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "12px",
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    <i
                      className="fas fa-circle-check"
                      style={{
                        color: "var(--primary)",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    ></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div style={{ marginBottom: "28px" }}>
              <h4
                style={{
                  fontSize: "1.15rem",
                  marginBottom: "14px",
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <i
                  className="fas fa-clipboard-check"
                  style={{ color: "var(--primary)" }}
                ></i>
                Requirements
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {requirements.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "12px",
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    <i
                      className="fas fa-circle-dot"
                      style={{
                        color: "var(--primary)",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    ></i>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hiring Manager Contact */}
            <div
              style={{
                border: "2px dashed rgba(168, 85, 247, 0.4)",
                background: "rgba(168, 85, 247, 0.05)",
                borderRadius: "14px",
                padding: "18px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <i
                className="fas fa-user-tie"
                style={{
                  color: "var(--primary)",
                  fontSize: "1.3rem",
                }}
              ></i>
              <div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "2px",
                  }}
                >
                  Hiring Manager
                </div>
                <div
                  style={{
                    color: "var(--text)",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                  }}
                >
                  Apply via WhatsApp below
                </div>
              </div>
            </div>

            {/* Apply via WhatsApp */}
            <a
              href="https://wa.me/923110523073"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "center",
                background: "#25D366",
                color: "#fff",
                padding: "14px 20px",
                fontSize: "0.95rem",
                borderRadius: "14px",
                fontWeight: 600,
                textDecoration: "none",
                lineHeight: "1.5",
              }}
            >
              <i
                className="fab fa-whatsapp"
                style={{ fontSize: "1.4rem", color: "#fff", marginRight: "8px", verticalAlign: "middle" }}
              ></i>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="why-us-section">
        <div className="container">
          <div className="section-header reveal">
            <h2>
              Why Work <span className="gradient-text">With Us?</span>
            </h2>
            <p>
              At ElevateEdge, we invest in our people. Here&apos;s what you can
              expect when you join our team.
            </p>
          </div>
          <div className="why-us-grid">
            {perks.map((p, i) => (
              <div
                className="why-us-card reveal"
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="why-us-icon">
                  <i className={`fas ${p.icon}`}></i>
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Ready to Apply or Have Questions?</h2>
          <p>
            Reach out to our hiring manager on WhatsApp or place an order to
            experience our services first-hand.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            <a
              href="https://wa.me/923110523073"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-pulse"
              style={{
                background: "#25D366",
                color: "#fff",
              }}
            >
              <i className="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
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
        </div>
      </section>
    </>
  );
}
