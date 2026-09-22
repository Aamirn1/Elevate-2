"use client";

import { useCallback, useEffect, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  company: string;
  companyUrl: string;
  sortOrder: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export function AdminTestimonials() {
  useScrollReveal();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    avatar: "",
    rating: 5,
    quote: "",
    company: "",
    companyUrl: "",
    featured: false,
    published: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm({
      name: "",
      role: "",
      avatar: "",
      rating: 5,
      quote: "",
      company: "",
      companyUrl: "",
      featured: false,
      published: true,
    });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(t: Testimonial) {
    setEditing(t);
    setForm({
      name: t.name,
      role: t.role,
      avatar: t.avatar,
      rating: t.rating,
      quote: t.quote,
      company: t.company,
      companyUrl: t.companyUrl,
      featured: t.featured,
      published: t.published,
    });
    setShowForm(true);
    window.scrollTo({ top: 40, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      const url = editing
        ? `/api/testimonials/${editing.id}`
        : "/api/testimonials";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      await load();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    try {
      await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete.");
    }
  }

  async function togglePublished(t: Testimonial) {
    try {
      await fetch(`/api/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !t.published }),
      });
      await load();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleFeatured(t: Testimonial) {
    try {
      await fetch(`/api/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !t.featured }),
      });
      await load();
    } catch (err) {
      console.error(err);
    }
  }

  // Drag-and-drop reorder
  function onDragStart(index: number) {
    setDragIndex(index);
  }
  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }
  async function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    // Assign new sort orders
    const withOrder = reordered.map((t, i) => ({ ...t, sortOrder: i + 1 }));
    setItems(withOrder);
    setDragIndex(null);
    setDragOverIndex(null);
    // Persist new order
    try {
      await Promise.all(
        withOrder.map((t) =>
          fetch(`/api/testimonials/${t.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: t.sortOrder }),
          })
        )
      );
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
    fontSize: "0.9rem",
    outline: "none",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h3 style={{ margin: 0 }}>
          Testimonials ({items.length}){" "}
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontWeight: 400,
            }}
          >
            — drag to reorder
          </span>
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-outline"
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            onClick={load}
          >
            <i className="fas fa-sync"></i> Refresh
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <i className="fas fa-plus"></i> Add Testimonial
          </button>
        </div>
      </div>

      {showForm && (
        <div
          className="admin-form-card"
          style={{
            background: "var(--bg-card)",
            padding: "24px",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            marginBottom: "24px",
          }}
        >
          <h4 style={{ marginTop: 0 }}>
            {editing ? "Edit Testimonial" : "Add New Testimonial"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  style={fieldStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Role / Title
                </label>
                <input
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  placeholder="e.g. CEO at Acme"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Company
                </label>
                <input
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  style={fieldStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Company URL
                </label>
                <input
                  value={form.companyUrl}
                  onChange={(e) =>
                    setForm({ ...form, companyUrl: e.target.value })
                  }
                  placeholder="https://"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Avatar URL
                </label>
                <input
                  value={form.avatar}
                  onChange={(e) =>
                    setForm({ ...form, avatar: e.target.value })
                  }
                  placeholder="/portfolio/avatar.jpg or https://"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginBottom: "4px",
                  }}
                >
                  Rating (1-5)
                </label>
                <select
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: parseInt(e.target.value) })
                  }
                  style={fieldStyle}
                >
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {"★".repeat(r)} ({r})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                Quote / Testimonial Text *
              </label>
              <textarea
                required
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                rows={4}
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "14px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                Featured (show prominently)
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />
                Published (visible on site)
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ padding: "10px 22px", fontSize: "0.9rem" }}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving…
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>{" "}
                    {editing ? "Update" : "Save"} Testimonial
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
                style={{ padding: "10px 22px", fontSize: "0.9rem" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
          }}
        >
          <i
            className="fas fa-spinner fa-spin"
            style={{ fontSize: "1.5rem", marginBottom: "12px" }}
          ></i>
          <div>Loading testimonials…</div>
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
          }}
        >
          <i
            className="fas fa-star"
            style={{ fontSize: "2rem", marginBottom: "12px" }}
          ></i>
          <div>No testimonials yet. Click "Add Testimonial" to create one.</div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {items.map((t, i) => (
            <div
              key={t.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDrop={() => onDrop(i)}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                background:
                  dragOverIndex === i
                    ? "rgba(168,85,247,0.08)"
                    : "var(--bg-card)",
                border:
                  dragOverIndex === i
                    ? "2px dashed var(--primary)"
                    : "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px",
                cursor: "grab",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <i
                  className="fas fa-grip-vertical"
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "1.1rem",
                  }}
                ></i>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  #{t.sortOrder}
                </span>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  overflow: "hidden",
                }}
              >
                {t.avatar ? (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  t.name.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "4px",
                  }}
                >
                  <strong style={{ color: "var(--text-heading)" }}>
                    {t.name}
                  </strong>
                  {t.role && (
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {t.role}
                    </span>
                  )}
                  {t.featured && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--primary)",
                        background: "rgba(168,85,247,0.12)",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}
                    >
                      ★ Featured
                    </span>
                  )}
                  {!t.published && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#ef4444",
                        background: "rgba(239,68,68,0.08)",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontWeight: 600,
                      }}
                    >
                      Hidden
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: "#fbbf24",
                    fontSize: "0.85rem",
                    marginBottom: "4px",
                  }}
                >
                  {"★".repeat(t.rating)}
                  {"☆".repeat(5 - t.rating)}
                </div>
                <p
                  style={{
                    margin: "0 0 6px 0",
                    color: "var(--text-muted)",
                    fontSize: "0.88rem",
                    lineHeight: 1.5,
                  }}
                >
                  "{t.quote}"
                </p>
                {t.company && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <i className="fas fa-building"></i> {t.company}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <button
                  className="btn btn-outline"
                  style={{
                    padding: "5px 10px",
                    fontSize: "0.78rem",
                  }}
                  onClick={() => startEdit(t)}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button
                  className="btn btn-outline"
                  style={{
                    padding: "5px 10px",
                    fontSize: "0.78rem",
                  }}
                  onClick={() => toggleFeatured(t)}
                >
                  <i className="fas fa-star"></i>{" "}
                  {t.featured ? "Unfeat" : "Feature"}
                </button>
                <button
                  className="btn btn-outline"
                  style={{
                    padding: "5px 10px",
                    fontSize: "0.78rem",
                  }}
                  onClick={() => togglePublished(t)}
                >
                  <i className={`fas fa-${t.published ? "eye-slash" : "eye"}`}></i>{" "}
                  {t.published ? "Hide" : "Show"}
                </button>
                <button
                  className="btn btn-outline"
                  style={{
                    padding: "5px 10px",
                    fontSize: "0.78rem",
                    color: "#ef4444",
                    borderColor: "rgba(239,68,68,0.3)",
                  }}
                  onClick={() => handleDelete(t.id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
