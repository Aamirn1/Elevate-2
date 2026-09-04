"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("theme") !== "light";
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 20px",
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        color: "var(--text)",
        fontSize: "0.95rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.3s var(--ease)",
        width: "100%",
        justifyContent: "center",
      }}
    >
      <i
        className={`fas ${isDark ? "fa-sun" : "fa-moon"}`}
        style={{ fontSize: "1rem", color: "var(--primary)" }}
      ></i>
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
