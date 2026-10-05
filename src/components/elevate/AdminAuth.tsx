"use client";

import { useState, useSyncExternalStore } from "react";
import { AdminPage } from "./pages/AdminPage";

const ADMIN_PASSWORD = "@#$&16609";
const STORAGE_KEY = "eed_admin_authed";

interface AdminAuthProps {
  onNavigate: (path: string) => void;
}

// useSyncExternalStore for reading sessionStorage reactively (SSR-safe).
const AUTH_EVENT = "eed-admin-auth-change";

function subscribeSession(callback: () => void): () => void {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
    window.addEventListener(AUTH_EVENT, callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener(AUTH_EVENT, callback);
    };
  }
  return () => {};
}

function notifyAuthChange() {
  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {
    // ignore
  }
}

function getAuthedSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getAuthedServerSnapshot(): boolean {
  return false;
}

export function AdminAuth({ onNavigate }: AdminAuthProps) {
  // useSyncExternalStore is SSR-safe and avoids setState-in-effect warnings.
  const storedAuthed = useSyncExternalStore(
    subscribeSession,
    getAuthedSnapshot,
    getAuthedServerSnapshot
  );
  // Local state for immediate UI updates (login/logout without waiting for event).
  const [localAuthed, setLocalAuthed] = useState(false);
  const authed = storedAuthed || localAuthed;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Verify locally against the known password.
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      // Also call the API for parity (best-effort).
      fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }).catch(() => {});
      setTimeout(() => {
        setLoading(false);
        setLocalAuthed(true);
        notifyAuthChange();
      }, 250);
    } else {
      setTimeout(() => {
        setError("Incorrect password. Please try again.");
        setLoading(false);
      }, 250);
    }
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setLocalAuthed(false);
    notifyAuthChange();
    setPassword("");
  }

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--gradient-hero)",
          padding: "20px",
        }}
      >
        <div
          className="admin-login-card reveal"
          style={{
            maxWidth: "440px",
            width: "100%",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "40px 36px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "var(--gradient-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                boxShadow: "0 8px 24px rgba(168,85,247,0.4)",
              }}
            >
              <i
                className="fas fa-lock"
                style={{ fontSize: "1.8rem", color: "#fff" }}
              ></i>
            </div>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "var(--text-heading)",
                marginBottom: "6px",
              }}
            >
              Admin Access
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.92rem",
              }}
            >
              Enter the admin password to manage the website.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "var(--bg-surface)",
                  border: "2px solid var(--border)",
                  borderRadius: "12px",
                  color: "var(--text)",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            {error && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginBottom: "12px",
                  padding: "8px 12px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "8px",
                }}
              >
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-pulse"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Verifying…
                </>
              ) : (
                <>
                  <i className="fas fa-unlock"></i> Unlock Admin Panel
                </>
              )}
            </button>
          </form>
          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border)",
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            <i className="fas fa-shield-alt"></i> Secured area — authorized
            personnel only.
          </div>
        </div>
      </div>
    );
  }

  return <AdminPage onNavigate={onNavigate} onLogout={handleLogout} />;
}
