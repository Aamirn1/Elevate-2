"use client";

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer>
      <div className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="navbar-brand footer-brand" style={{ marginBottom: "16px" }}>
                <div className="brand-metallic-wrap">
                  <div className="brand-logo-glass">
                    <svg
                      className="brand-logo-svg"
                      viewBox="0 0 100 85"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id="footer_logo_grad"
                          x1="0"
                          y1="0"
                          x2="100"
                          y2="85"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#a855f7" />
                          <stop offset="1" stopColor="#ec4899" />
                        </linearGradient>
                        <linearGradient
                          id="footer_shine_grad"
                          x1="-100%"
                          y1="0%"
                          x2="0%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="white" stopOpacity="0" />
                          <stop offset="50%" stopColor="white" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="white" stopOpacity="0" />
                          <animate
                            attributeName="x1"
                            from="-100%"
                            to="200%"
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="x2"
                            from="0%"
                            to="300%"
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </linearGradient>
                        <mask id="footer_shine_mask">
                          <rect x="0" y="0" width="100" height="85" fill="black" />
                          <rect x="0" y="55" width="16" height="30" rx="3" fill="white" />
                          <rect x="22" y="35" width="16" height="50" rx="3" fill="white" />
                          <rect x="44" y="15" width="16" height="70" rx="3" fill="white" />
                          <rect x="66" y="0" width="16" height="85" rx="3" fill="white" />
                        </mask>
                      </defs>
                      <rect x="0" y="55" width="16" height="30" rx="3" fill="url(#footer_logo_grad)" opacity="0.4" />
                      <rect x="22" y="35" width="16" height="50" rx="3" fill="url(#footer_logo_grad)" opacity="0.6" />
                      <rect x="44" y="15" width="16" height="70" rx="3" fill="url(#footer_logo_grad)" opacity="0.8" />
                      <rect x="66" y="0" width="16" height="85" rx="3" fill="url(#footer_logo_grad)" />
                      <rect
                        width="100"
                        height="85"
                        fill="url(#footer_shine_grad)"
                        mask="url(#footer_shine_mask)"
                        style={{ mixBlendMode: "screen" }}
                      />
                    </svg>
                  </div>
                  <div className="brand-text-glass" data-text="Elevate Edge">
                    <span className="elevate">Elevate</span>{" "}
                    <span className="edge highlight">Edge</span>
                  </div>
                </div>
              </div>
              <p>
                Amplify your business growth with our budget-friendly digital
                solutions. We create stunning websites, run targeted campaigns,
                and manage your social presence — all tailored to maximize your
                ROI.
              </p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <a href="#/" onClick={(e) => handleNav(e, "/")}>
                Home
              </a>
              <a href="#/services" onClick={(e) => handleNav(e, "/services")}>
                Services
              </a>
              <a href="#/portfolio" onClick={(e) => handleNav(e, "/portfolio")}>
                Testimonials
              </a>
              <a href="#/pricing" onClick={(e) => handleNav(e, "/pricing")}>
                Pricing
              </a>
              <a href="#/blog" onClick={(e) => handleNav(e, "/blog")}>
                Blog
              </a>
              <a href="#/career" onClick={(e) => handleNav(e, "/career")}>
                Careers
              </a>
              <a href="#/about" onClick={(e) => handleNav(e, "/about")}>
                About Us
              </a>
            </div>
            <div className="footer-col">
              <h4>Our Services</h4>
              <a href="#/services" onClick={(e) => handleNav(e, "/services")}>
                Website Development
              </a>
              <a href="#/services" onClick={(e) => handleNav(e, "/services")}>
                Digital Marketing
              </a>
              <a href="#/services" onClick={(e) => handleNav(e, "/services")}>
                Social Media
              </a>
              <a href="#/services" onClick={(e) => handleNav(e, "/services")}>
                Virtual Assistant
              </a>
            </div>
            <div className="footer-col">
              <h4>Get in Touch</h4>
              <a
                href="https://wa.me/923110523073"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp"></i> +92 311 0523073
              </a>
              <a href="#/contact" onClick={(e) => handleNav(e, "/contact")}>
                <i className="fas fa-map-marker-alt"></i> Available Worldwide
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; {year} ElevateEdge Digital. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
