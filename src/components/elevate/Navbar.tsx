"use client";

import { useEffect, useState } from "react";

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navLinks = [
  { href: "/", label: "Home", page: "home" },
  { href: "/services", label: "Services", page: "services" },
  { href: "/portfolio", label: "Testimonials", page: "portfolio" },
  { href: "/pricing", label: "Pricing", page: "pricing" },
  { href: "/career", label: "Careers", page: "career" },
  { href: "/about", label: "About Us", page: "about" },
];

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll + hide WhatsApp FAB when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("menu-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
    setMenuOpen(false);
  };

  return (
    <nav>
      <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container">
          <a
            href="#/"
            className="navbar-brand"
            onClick={(e) => handleNav(e, "/")}
          >
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
                      id="logo_grad"
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
                      id="shine_grad"
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
                    <mask id="shine_mask">
                      <rect x="0" y="0" width="100" height="85" fill="black" />
                      <rect x="0" y="55" width="16" height="30" rx="3" fill="white" />
                      <rect x="22" y="35" width="16" height="50" rx="3" fill="white" />
                      <rect x="44" y="15" width="16" height="70" rx="3" fill="white" />
                      <rect x="66" y="0" width="16" height="85" rx="3" fill="white" />
                    </mask>
                  </defs>
                  <rect x="0" y="55" width="16" height="30" rx="3" fill="url(#logo_grad)" opacity="0.4" />
                  <rect x="22" y="35" width="16" height="50" rx="3" fill="url(#logo_grad)" opacity="0.6" />
                  <rect x="44" y="15" width="16" height="70" rx="3" fill="url(#logo_grad)" opacity="0.8" />
                  <rect x="66" y="0" width="16" height="85" rx="3" fill="url(#logo_grad)" />
                  <rect
                    width="100"
                    height="85"
                    fill="url(#shine_grad)"
                    mask="url(#shine_mask)"
                    style={{ mixBlendMode: "screen" }}
                  />
                </svg>
              </div>
              <div className="brand-text-glass" data-text="Elevate Edge">
                <span className="elevate">Elevate</span>{" "}
                <span className="edge highlight">Edge</span>
              </div>
            </div>
          </a>
          <div className={`nav-links ${menuOpen ? "open" : ""}`} id="nav-links">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                data-page={link.page}
                className={currentPath === link.href ? "active" : ""}
                onClick={(e) => handleNav(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#/contact"
              className="nav-cta btn-pulse"
              onClick={(e) => handleNav(e, "/contact")}
            >
              Order Now
            </a>
          </div>
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            id="hamburger"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
