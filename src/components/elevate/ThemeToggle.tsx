"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <button
        onClick={() => setTheme(true)}
        aria-label="Dark Mode"
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "1.1rem",
          background: isDark ? "var(--gradient-primary)" : "transparent",
          color: isDark ? "#fff" : "var(--text-muted)",
          border: isDark ? "none" : "1px solid var(--border)",
          transition: "all 0.3s var(--ease)",
        }}
      >
        <i className="fas fa-moon"></i>
      </button>
      <button
        onClick={() => setTheme(false)}
        aria-label="Light Mode"
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "1.1rem",
          background: !isDark ? "var(--gradient-primary)" : "transparent",
          color: !isDark ? "#fff" : "var(--text-muted)",
          border: !isDark ? "none" : "1px solid var(--border)",
          transition: "all 0.3s var(--ease)",
        }}
      >
        <i className="fas fa-sun"></i>
      </button>
    </div>
  );
}
