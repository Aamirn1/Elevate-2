"use client";

import { useScrollReveal } from "../useScrollReveal";

interface ServiceDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

interface ServiceDetail {
  slug: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  benefits: { icon: string; title: string; desc: string }[];
}

const services: ServiceDetail[] = [
  {
    slug: "web-development",
    icon: "fa-laptop-code",
    title: "Custom Website Development",
    tagline: "Responsive, modern websites tailored to your industry.",
    description:
      "We build responsive, multi-page websites tailored to any industry — retail, food, professional services, and more. Each site features modern design elements, mobile-friendly layouts, and engaging animations that captivate your visitors and convert them into customers.",
    features: [
      "Fully responsive multi-page designs",
      "Animated 3D icons & interactive graphics",
      "SEO optimized for search engines",
      "Fast loading & modern tech stack",
      "CMS integration & e-commerce ready",
      "Cross-browser compatibility",
      "Accessibility best practices",
    ],
    benefits: [
      {
        icon: "fa-mobile-screen",
        title: "Mobile-First Design",
        desc: "Flawless experiences on every screen size, from phones to desktops.",
      },
      {
        icon: "fa-bolt",
        title: "Lightning Fast",
        desc: "Optimized for speed with modern frameworks and best practices.",
      },
      {
        icon: "fa-magnifying-glass",
        title: "SEO Friendly",
        desc: "Built to rank on search engines with clean semantic markup.",
      },
      {
        icon: "fa-paintbrush",
        title: "Custom Design",
        desc: "Unique visuals and animations that match your brand identity.",
      },
    ],
  },
  {
    slug: "digital-marketing",
    icon: "fa-bullhorn",
    title: "Digital Marketing & Ads",
    tagline: "Data-driven campaigns that maximize your ROI.",
    description:
      "We run data-driven marketing campaigns across Google Ads, Facebook, and Instagram to boost your online presence. Our budget-friendly packages maximize your ROI with targeted strategies that deliver real, measurable results for your business.",
    features: [
      "Google Ads & PPC management",
      "Facebook & Instagram ad campaigns",
      "Audience targeting & retargeting",
      "Performance analytics & reporting",
      "Budget optimization",
      "A/B testing & creative iteration",
      "Conversion tracking setup",
    ],
    benefits: [
      {
        icon: "fa-bullseye",
        title: "Precise Targeting",
        desc: "Reach the right audience with data-backed segmentation.",
      },
      {
        icon: "fa-chart-line",
        title: "Measurable Results",
        desc: "Transparent dashboards showing exactly how your budget performs.",
      },
      {
        icon: "fa-coins",
        title: "Budget Friendly",
        desc: "Packages tailored to fit startups, SMEs, and enterprises alike.",
      },
      {
        icon: "fa-rotate",
        title: "Continuous Optimization",
        desc: "We refine campaigns weekly to improve ROI over time.",
      },
    ],
  },
  {
    slug: "social-media",
    icon: "fa-hashtag",
    title: "Social Media Management",
    tagline: "Grow your audience with strategic, engaging content.",
    description:
      "Our team creates and manages your business's social media profiles — content calendars, eye-catching graphics, and strategic postings to engage your customers and grow your following organically across all major platforms.",
    features: [
      "Content calendar & strategy",
      "Custom graphic design",
      "Community management & engagement",
      "Hashtag research & trend analysis",
      "Monthly reporting",
      "Reels & short-form video content",
      "Influencer collaboration outreach",
    ],
    benefits: [
      {
        icon: "fa-calendar-check",
        title: "Consistent Posting",
        desc: "A planned content calendar keeps your brand top-of-mind.",
      },
      {
        icon: "fa-comments",
        title: "Active Engagement",
        desc: "We reply, interact, and build relationships with your community.",
      },
      {
        icon: "fa-image",
        title: "Eye-Catching Graphics",
        desc: "Custom-designed visuals that match your brand aesthetic.",
      },
      {
        icon: "fa-chart-simple",
        title: "Growth Reporting",
        desc: "Monthly insights show follower growth, reach, and engagement.",
      },
    ],
  },
  {
    slug: "app-development",
    icon: "fa-mobile-alt",
    title: "App Development for Business",
    tagline: "Premium mobile apps for iOS and Android.",
    description:
      "We design and develop premium iOS and Android applications that provide a seamless mobile experience for your customers. From intuitive user interfaces to powerful backend integrations, we build apps that drive engagement and growth.",
    features: [
      "Custom iOS & Android development",
      "Native-like hybrid app solutions",
      "Premium UI/UX mobile design",
      "API & database integration",
      "App store deployment & support",
      "Push notifications & in-app messaging",
      "Offline-first architecture",
    ],
    benefits: [
      {
        icon: "fa-mobile-screen-button",
        title: "Cross-Platform",
        desc: "One codebase that runs beautifully on both iOS and Android.",
      },
      {
        icon: "fa-wand-magic-sparkles",
        title: "Premium UI/UX",
        desc: "Smooth animations and intuitive flows that users love.",
      },
      {
        icon: "fa-plug",
        title: "Powerful Integrations",
        desc: "Connect to your existing APIs, databases, and third-party tools.",
      },
      {
        icon: "fa-cloud-arrow-up",
        title: "Store Deployment",
        desc: "We handle App Store and Play Store submission end-to-end.",
      },
    ],
  },
  {
    slug: "saas-solutions",
    icon: "fa-cogs",
    title: "Software Development (SAAS)",
    tagline: "Scalable, cloud-based software tailored to your operations.",
    description:
      "Build scalable, cloud-based software solutions tailored for business management. We specialize in creating custom SaaS platforms that automate workflows, manage data efficiently, and scale as your business grows.",
    features: [
      "Custom SaaS platform architecture",
      "Workflow automation & tools",
      "Scalable cloud infrastructure",
      "Advanced data analytics & reporting",
      "Multi-tenant security & management",
      "Role-based access control",
      "Third-party API integrations",
    ],
    benefits: [
      {
        icon: "fa-expand",
        title: "Built to Scale",
        desc: "Architecture that grows from your first user to your millionth.",
      },
      {
        icon: "fa-gears",
        title: "Workflow Automation",
        desc: "Automate repetitive tasks so your team can focus on what matters.",
      },
      {
        icon: "fa-shield-halved",
        title: "Enterprise Security",
        desc: "Multi-tenant isolation, RBAC, and encryption baked in.",
      },
      {
        icon: "fa-database",
        title: "Data-Driven",
        desc: "Real-time analytics and reporting to inform your decisions.",
      },
    ],
  },
  {
    slug: "virtual-assistant",
    icon: "fa-headset",
    title: "Virtual Assistant Service",
    tagline: "Dedicated support for daily operations and client queries.",
    description:
      "A dedicated virtual assistant service for businesses to manage daily business operations and handle client-side queries efficiently. Our virtual assistants help you stay organized, responsive, and focused on growth while we handle the day-to-day.",
    features: [
      "Business management & admin support",
      "Client query handling & responses",
      "WhatsApp & email management",
      "Lead capture & CRM integration",
      "Daily reporting & analytics",
      "Calendar & appointment scheduling",
      "Follow-up & reminder management",
    ],
    benefits: [
      {
        icon: "fa-clock",
        title: "Save Time",
        desc: "Offload routine tasks and reclaim hours every single day.",
      },
      {
        icon: "fa-user-check",
        title: "Dedicated Support",
        desc: "A trained assistant who understands your business inside-out.",
      },
      {
        icon: "fa-comments-dollar",
        title: "More Conversions",
        desc: "Faster client responses mean more leads turn into customers.",
      },
      {
        icon: "fa-clipboard-list",
        title: "Transparent Reporting",
        desc: "Daily summaries keep you in the loop on everything handled.",
      },
    ],
  },
];

export function ServiceDetailPage({ slug, onNavigate }: ServiceDetailPageProps) {
  useScrollReveal();

  const service = services.find((s) => s.slug === slug) || services[0];

  return (
    <>
      {/* Back Button */}
      <div
        className="container"
        style={{
          paddingTop: "110px",
          paddingBottom: "10px",
        }}
      >
        <button
          type="button"
          className="btn btn-outline"
          style={{
            padding: "7px 16px",
            fontSize: "0.82rem",
          }}
          onClick={() => onNavigate("/services")}
        >
          <i className="fas fa-arrow-left"></i> Back to Services
        </button>
      </div>

      {/* Hero */}
      <section
        className="hero"
        style={{ minHeight: "auto", padding: "30px 0 50px" }}
      >
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="container">
          <div
            className="hero-content"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
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
                className={`fas ${service.icon}`}
                style={{
                  fontSize: "2rem",
                  color: "var(--primary)",
                }}
              ></i>
            </div>
            <h1 style={{ marginBottom: "12px" }}>
              <span className="gradient-text">{service.title}</span>
            </h1>
            <p
              className="hero-sub"
              style={{ maxWidth: "640px", margin: "0 auto" }}
            >
              {service.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="services-section" style={{ padding: "20px 0 60px" }}>
        <div className="container">
          <div
            className="value-card reveal"
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              padding: "32px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
            }}
          >
            <h3
              style={{
                fontSize: "1.3rem",
                marginBottom: "14px",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <i
                className="fas fa-circle-info"
                style={{ color: "var(--primary)" }}
              ></i>
              Overview
            </h3>
            <p
              style={{
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              {service.description}
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="why-us-section" style={{ padding: "20px 0 60px" }}>
        <div className="container">
          <div className="section-header reveal">
            <h2>
              What&apos;s <span className="gradient-text">Included?</span>
            </h2>
            <p>Everything you get when you choose this service.</p>
          </div>
          <div
            className="value-card reveal"
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              padding: "32px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                marginBottom: "24px",
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
                  marginBottom: "14px",
                }}
              >
                <i
                  className={`fas ${service.icon}`}
                  style={{
                    fontSize: "1.6rem",
                    color: "var(--primary)",
                  }}
                ></i>
              </div>
              <h3
                style={{
                  fontSize: "1.4rem",
                  color: "var(--text)",
                  marginBottom: 0,
                }}
              >
                {service.title}
              </h3>
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
              }}
            >
              {service.features.map((f, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    padding: "10px 14px",
                    background: "rgba(168, 85, 247, 0.04)",
                    border: "1px solid rgba(168, 85, 247, 0.15)",
                    borderRadius: "10px",
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
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="why-us-section" style={{ padding: "20px 0 60px" }}>
        <div className="container">
          <div className="section-header reveal">
            <h2>
              Key <span className="gradient-text">Benefits</span>
            </h2>
            <p>Why this service delivers real value to your business.</p>
          </div>
          <div className="why-us-grid">
            {service.benefits.map((b, i) => (
              <div
                className="why-us-card reveal"
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="why-us-icon">
                  <i className={`fas ${b.icon}`}></i>
                </div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Ready to Get Started?</h2>
          <p>
            Place an order or chat with our team on WhatsApp to learn more about
            this service.
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
              href="#/contact"
              className="btn btn-primary btn-pulse"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/contact");
              }}
            >
              <i className="fas fa-bolt"></i> Order Now
            </a>
            <a
              href="https://wa.me/923110523073"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-pulse"
              style={{ background: "#25D366", color: "#fff" }}
            >
              <i className="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
