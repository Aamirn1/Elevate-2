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
              <div className="navbar-brand" style={{ marginBottom: "16px" }}>
                <span>Elevate</span>
                <span className="highlight">Edge</span>
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
                href="https://wa.me/923205719979"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp"></i> +92 320 571 9979
              </a>
              <a href="mailto:elevateedgedigitalagency@gmail.com">
                <i className="fas fa-envelope"></i>{" "}
                elevateedgedigitalagency@gmail.com
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
