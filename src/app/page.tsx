"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Navbar } from "@/components/elevate/Navbar";
import { Footer } from "@/components/elevate/Footer";
import { WhatsAppFab } from "@/components/elevate/WhatsAppFab";
import { ScrollTop } from "@/components/elevate/ScrollTop";
import { HomePage } from "@/components/elevate/pages/HomePage";
import { ServicesPage } from "@/components/elevate/pages/ServicesPage";
import { PortfolioPage } from "@/components/elevate/pages/PortfolioPage";
import { AboutPage } from "@/components/elevate/pages/AboutPage";
import { ContactPage } from "@/components/elevate/pages/ContactPage";
import { CareerPage } from "@/components/elevate/pages/CareerPage";
import { PricingPage } from "@/components/elevate/pages/PricingPage";
import { ServiceDetailPage } from "@/components/elevate/pages/ServiceDetailPage";
import { AdminPage } from "@/components/elevate/pages/AdminPage";

const routeTitles: Record<string, string> = {
  "/": "Home | ElevateEdge Digital",
  "/services": "Services | ElevateEdge Digital",
  "/services/web-development": "Web Development | ElevateEdge Digital",
  "/services/digital-marketing": "Digital Marketing | ElevateEdge Digital",
  "/services/social-media": "Social Media | ElevateEdge Digital",
  "/services/app-development": "App Development | ElevateEdge Digital",
  "/services/saas-solutions": "SaaS Solutions | ElevateEdge Digital",
  "/services/virtual-assistant": "Virtual Assistant | ElevateEdge Digital",
  "/portfolio": "Testimonials | ElevateEdge Digital",
  "/about": "About Us | ElevateEdge Digital",
  "/contact": "Order Now | ElevateEdge Digital",
  "/career": "Careers | ElevateEdge Digital",
  "/pricing": "Pricing | ElevateEdge Digital",
  "/admin": "Admin Dashboard | ElevateEdge Digital",
};

// Subscribe to browser hash changes (external store)
function subscribeHashChange(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot(): string {
  const hash = window.location.hash.slice(1);
  return hash || "/";
}

function getHashServerSnapshot(): string {
  return "/";
}

export default function Home() {
  // useSyncExternalStore is the React-recommended way to read browser state
  // like location.hash without causing setState-in-effect lint warnings.
  const currentPath = useSyncExternalStore(
    subscribeHashChange,
    getHashSnapshot,
    getHashServerSnapshot
  );

  // Side effects on route change: update title + scroll to top.
  // (No setState here — page remount happens naturally via the `key` prop.)
  useEffect(() => {
    document.title = routeTitles[currentPath] || "ElevateEdge Digital";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [currentPath]);

  const navigate = (path: string) => {
    const targetHash = path === "/" ? "#/" : `#${path}`;
    if (window.location.hash === targetHash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = targetHash;
  };

  const renderPage = () => {
    switch (currentPath) {
      case "/":
        return <HomePage onNavigate={navigate} />;
      case "/services":
        return <ServicesPage onNavigate={navigate} />;
      case "/services/web-development":
        return (
          <ServiceDetailPage slug="web-development" onNavigate={navigate} />
        );
      case "/services/digital-marketing":
        return (
          <ServiceDetailPage slug="digital-marketing" onNavigate={navigate} />
        );
      case "/services/social-media":
        return (
          <ServiceDetailPage slug="social-media" onNavigate={navigate} />
        );
      case "/services/app-development":
        return (
          <ServiceDetailPage slug="app-development" onNavigate={navigate} />
        );
      case "/services/saas-solutions":
        return (
          <ServiceDetailPage slug="saas-solutions" onNavigate={navigate} />
        );
      case "/services/virtual-assistant":
        return (
          <ServiceDetailPage slug="virtual-assistant" onNavigate={navigate} />
        );
      case "/portfolio":
        return <PortfolioPage onNavigate={navigate} />;
      case "/about":
        return <AboutPage onNavigate={navigate} />;
      case "/contact":
        return <ContactPage />;
      case "/career":
        return <CareerPage onNavigate={navigate} />;
      case "/pricing":
        return <PricingPage onNavigate={navigate} />;
      case "/admin":
        return <AdminPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div
      id="app"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main
        id="page-content"
        className="page-transition-active"
        style={{ flex: 1, flexShrink: 0 }}
      >
        {renderPage()}
      </main>
      <Footer onNavigate={navigate} />
      <WhatsAppFab />
      <ScrollTop currentPath={currentPath} />
    </div>
  );
}
