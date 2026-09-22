"use client";

import { useEffect, useState, useCallback } from "react";
import { useScrollReveal } from "../useScrollReveal";
import { AdminTestimonials } from "./AdminTestimonials";
import { AdminBlog } from "./AdminBlog";

interface AdminPageProps {
  onNavigate: (path: string) => void;
  onLogout?: () => void;
}

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  url: string;
  sortOrder: number | null;
  createdAt: string;
}

interface Order {
  id: number;
  clientName: string;
  clientEmail: string;
  inviteCode: string | null;
  status: string;
  businessType: string | null;
  services: string | null;
  budget: string | null;
  message: string;
  createdAt: string;
}

interface Partner {
  id: number;
  contactInfo: string;
  inviteCode: string;
  createdAt: string;
}

const statusOptions = ["pending", "contact", "meeting", "order", "complete"];

export function AdminPage({ onNavigate, onLogout }: AdminPageProps) {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState<
    "projects" | "orders" | "partners" | "testimonials" | "blog"
  >("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    image: "",
    url: "",
    sortOrder: "",
  });
  const [saving, setSaving] = useState(false);

  // Auth is handled by AdminAuth wrapper; no localStorage check needed here.

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/orders${
          searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""
        }`
      );
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }, [searchTerm]);

  const loadPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/partners");
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error("Failed to load partners:", err);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    loadOrders();
  }, [loadProjects, loadOrders]);

  // Reload orders when search changes (debounced)
  useEffect(() => {
    const t = setTimeout(loadOrders, 300);
    return () => clearTimeout(t);
  }, [searchTerm, loadOrders]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      onNavigate("/");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
      image: project.image,
      url: project.url,
      sortOrder: project.sortOrder?.toString() || "",
    });
    window.scrollTo({ top: 40, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      tags: "",
      image: "",
      url: "",
      sortOrder: "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      loadProjects();
    } catch (err) {
      alert("Error deleting project");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const projectData = {
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(",").map((s) => s.trim()),
      image: formData.image,
      url: formData.url,
      sortOrder: formData.sortOrder,
    };

    try {
      const res = await fetch(
        editingId ? `/api/projects/${editingId}` : "/api/projects",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        }
      );
      if (!res.ok) throw new Error("Failed to save");
      handleCancelEdit();
      loadProjects();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Error saving project.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating status.");
    }
  };

  const toggleOrderExpand = (id: number) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const getPartnerForOrder = (inviteCode: string | null) => {
    if (!inviteCode) return null;
    return partners.find((p) => p.inviteCode === inviteCode) || null;
  };

  return (
    <section
      className="admin-section"
      style={{
        padding: "160px 0 60px",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <div className="container">
        <div
          className="admin-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <h2>
            Admin <span className="gradient-text">Dashboard</span>
          </h2>
          <a
            href="#/"
            className="btn btn-outline"
            style={{ padding: "8px 16px", cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <i className="fas fa-sign-out-alt"></i> Exit Admin
          </a>
        </div>

        <div
          className="admin-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* Left Sidebar */}
          <div
            className="admin-sidebar"
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Tab Navigation */}
            <div
              className="admin-tabs"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                background: "var(--bg-card)",
                padding: "20px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
              }}
            >
              {[
                {
                  key: "projects" as const,
                  icon: "fa-project-diagram",
                  label: "Manage Projects",
                },
                {
                  key: "orders" as const,
                  icon: "fa-clipboard-list",
                  label: "Order Tracking",
                },
                {
                  key: "partners" as const,
                  icon: "fa-users-cog",
                  label: "Registered Partners",
                },
                {
                  key: "testimonials" as const,
                  icon: "fa-star",
                  label: "Testimonials",
                },
                {
                  key: "blog" as const,
                  icon: "fa-blog",
                  label: "Blog Management",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`btn admin-tab-btn ${
                    activeTab === tab.key ? "btn-primary" : "btn-outline"
                  }`}
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    transform: "none",
                    transition: "all 0.3s ease",
                    background:
                      activeTab === tab.key ? "" : "transparent",
                    border:
                      activeTab === tab.key
                        ? ""
                        : "1px solid transparent",
                    color:
                      activeTab === tab.key
                        ? "#fff"
                        : "var(--text-muted)",
                  }}
                  onClick={() => {
                    setActiveTab(tab.key);
                    if (tab.key === "orders") loadOrders();
                    if (tab.key === "projects") loadProjects();
                    if (tab.key === "partners") loadPartners();
                  }}
                >
                  <i className={`fas ${tab.icon}`}></i> {tab.label}
                </button>
              ))}
            </div>

            {/* Add/Edit Form Card - only on projects tab */}
            {activeTab === "projects" && (
              <div
                className="admin-form-card"
                style={{
                  background: "var(--bg-card)",
                  padding: "30px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3 style={{ marginBottom: "20px" }}>
                  {editingId ? "Edit Project" : "Add New Project"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Project Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Modern UI Kit"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "8px",
                        marginBottom: "16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Premium Sub-line (Description)</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the project value..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "8px",
                        marginBottom: "16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tags (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. E-commerce, Premium, Web Design"
                      required
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "8px",
                        marginBottom: "16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Project Image</label>
                    <input
                      type="text"
                      placeholder="Paste image URL"
                      required
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "8px",
                        marginBottom: "16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Website URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      required
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "8px",
                        marginBottom: "16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Sequence</label>
                    <input
                      type="number"
                      placeholder="e.g. 1, 2, 3..."
                      min={1}
                      required
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "8px",
                        marginBottom: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        color: "#fff",
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#a0a0a0",
                        marginBottom: "24px",
                      }}
                    >
                      Lower number = appears first in portfolio slider.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled={saving}
                  >
                    {saving ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Save Project
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        marginTop: "12px",
                      }}
                      onClick={handleCancelEdit}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="admin-main-content">
            {/* Projects View */}
            {activeTab === "projects" && (
              <div className="admin-tab-content">
                <div
                  className="admin-list-card"
                  style={{
                    background: "var(--bg-surface)",
                    padding: "30px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h3 style={{ marginBottom: "20px" }}>
                    Manage Projects ({projects.length})
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {projects.length === 0 ? (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No projects found.
                      </p>
                    ) : (
                      projects.map((p) => (
                        <div
                          key={p.id}
                          className="admin-project-item"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--bg-card)",
                            padding: "16px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                            }}
                          >
                            <div
                              style={{
                                minWidth: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--primary)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                              }}
                            >
                              {p.sortOrder || "-"}
                            </div>
                            <img
                              src={p.image}
                              alt={p.title}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                            <div>
                              <h4
                                style={{
                                  margin: "0 0 4px 0",
                                  fontSize: "1.1rem",
                                }}
                              >
                                {p.title}
                              </h4>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "0.8rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {p.url}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                              onClick={() => handleEdit(p)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.8rem",
                                color: "#ff7675",
                                borderColor: "rgba(255, 118, 117, 0.3)",
                              }}
                              onClick={() => handleDelete(p.id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Orders View */}
            {activeTab === "orders" && (
              <div className="admin-tab-content">
                <div
                  className="admin-list-card"
                  style={{
                    background: "var(--bg-surface)",
                    padding: "30px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>
                      Order Tracking ({orders.length})
                    </h3>
                    <div
                      style={{ position: "relative", width: "250px", maxWidth: "100%" }}
                    >
                      <i
                        className="fas fa-search"
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search client email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px 8px 35px",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          color: "#fff",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {orders.length === 0 ? (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No orders matched your search.
                      </p>
                    ) : (
                      orders.map((o) => {
                        const partner = getPartnerForOrder(o.inviteCode);
                        const isExpanded = expandedOrders.includes(o.id);
                        const date = new Date(o.createdAt).toLocaleString();
                        return (
                          <div
                            key={o.id}
                            className="admin-order-item"
                            style={{
                              background: "var(--bg-card)",
                              borderRadius: "var(--radius-md)",
                              border: `1px solid ${
                                isExpanded ? "var(--primary)" : "var(--border)"
                              }`,
                              overflow: "hidden",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <div
                              className="order-header"
                              style={{
                                padding: "20px",
                                display: "grid",
                                gridTemplateColumns:
                                  "1.5fr 1fr 1.5fr 150px 30px",
                                gap: "15px",
                                alignItems: "center",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                              onClick={() => toggleOrderExpand(o.id)}
                            >
                              <div>
                                <h4
                                  style={{
                                    margin: "0 0 5px",
                                    fontSize: "1rem",
                                    color: "#fff",
                                  }}
                                >
                                  {o.clientName || "N/A"}
                                </h4>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "0.82rem",
                                    color: "var(--primary)",
                                  }}
                                >
                                  {o.clientEmail}
                                </p>
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {date}
                                </span>
                              </div>
                              <div>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Invitation Code
                                </span>
                                <code
                                  style={{
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "3px 6px",
                                    borderRadius: "4px",
                                    fontSize: "0.8rem",
                                    color: "var(--primary)",
                                  }}
                                >
                                  {o.inviteCode || "Direct"}
                                </code>
                              </div>
                              <div>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "0.7rem",
                                    color: "var(--text-muted)",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Partner Contact
                                </span>
                                {partner ? (
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    <i
                                      className={`fab fa-${
                                        partner.contactInfo.includes(
                                          "linkedin.com"
                                        )
                                          ? "linkedin"
                                          : "whatsapp"
                                      }`}
                                      style={{
                                        color: "var(--primary)",
                                        fontSize: "0.85rem",
                                      }}
                                    ></i>
                                    <span
                                      style={{
                                        fontSize: "0.8rem",
                                        color: "#fff",
                                      }}
                                    >
                                      {partner.contactInfo}
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    No partner match
                                  </span>
                                )}
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <select
                                  className="status-selector"
                                  value={o.status}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      o.id,
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    background: "rgba(255,255,255,0.05)",
                                    color: "#fff",
                                    border: "1px solid var(--border)",
                                    padding: "5px 8px",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    width: "100%",
                                  }}
                                >
                                  {statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                      {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <i
                                  className="fas fa-chevron-down toggle-icon"
                                  style={{
                                    color: "var(--text-muted)",
                                    transition: "transform 0.3s ease",
                                    transform: isExpanded
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  }}
                                ></i>
                              </div>
                            </div>

                            {isExpanded && (
                              <div
                                className="order-details-body"
                                style={{
                                  padding: "0 20px 20px",
                                  borderTop: "1px solid var(--border)",
                                  background: "rgba(255,255,255,0.01)",
                                }}
                              >
                                <div
                                  className="order-details-grid"
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "repeat(auto-fit, minmax(180px, 1fr))",
                                    gap: "15px",
                                    paddingTop: "15px",
                                  }}
                                >
                                  <div>
                                    <span
                                      style={{
                                        display: "block",
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      Business Type
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.85rem",
                                        color: "#fff",
                                      }}
                                    >
                                      {o.businessType || "Not specified"}
                                    </span>
                                  </div>
                                  <div>
                                    <span
                                      style={{
                                        display: "block",
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      Budget (USD)
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.85rem",
                                        color: "var(--primary)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {o.budget || "Not specified"}
                                    </span>
                                  </div>
                                  <div>
                                    <span
                                      style={{
                                        display: "block",
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      Services Requested
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "0.85rem",
                                        color: "#fff",
                                      }}
                                    >
                                      {o.services
                                        ? o.services
                                            .split(",")
                                            .join(", ")
                                        : "Not specified"}
                                    </span>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    marginTop: "20px",
                                    background: "rgba(255,255,255,0.02)",
                                    padding: "12px",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: "0.75rem",
                                      color: "var(--text-muted)",
                                      marginBottom: "6px",
                                    }}
                                  >
                                    Full Requirements &amp; Message
                                  </span>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: "0.85rem",
                                      color: "#fff",
                                      lineHeight: 1.6,
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {o.message || "No message provided"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Partners View */}
            {activeTab === "partners" && (
              <div className="admin-tab-content">
                <div
                  className="admin-list-card"
                  style={{
                    background: "var(--bg-surface)",
                    padding: "30px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>
                      Registered Partners ({partners.length})
                    </h3>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      onClick={loadPartners}
                    >
                      <i className="fas fa-sync"></i> Refresh
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    {partners.length === 0 ? (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No partners registered yet.
                      </p>
                    ) : (
                      partners.map((p) => {
                        const date = new Date(p.createdAt).toLocaleDateString();
                        return (
                          <div
                            key={p.id}
                            className="admin-partner-item"
                            style={{
                              background: "var(--bg-card)",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid var(--border)",
                              padding: "20px",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1.5fr",
                              gap: "15px",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                  marginBottom: "4px",
                                }}
                              >
                                Registered Date
                              </span>
                              <span
                                style={{ fontSize: "0.85rem", color: "#fff" }}
                              >
                                {date}
                              </span>
                            </div>
                            <div>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                  marginBottom: "4px",
                                }}
                              >
                                Invitation Code
                              </span>
                              <code
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  padding: "3px 6px",
                                  borderRadius: "4px",
                                  fontSize: "0.9rem",
                                  color: "var(--primary)",
                                  fontWeight: "bold",
                                }}
                              >
                                {p.inviteCode}
                              </code>
                            </div>
                            <div>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                  marginBottom: "4px",
                                }}
                              >
                                Contact Information
                              </span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <i
                                  className={`fab fa-${
                                    p.contactInfo.includes("linkedin.com")
                                      ? "linkedin"
                                      : "whatsapp"
                                  }`}
                                  style={{
                                    color: "var(--primary)",
                                    fontSize: "1rem",
                                  }}
                                ></i>
                                <span
                                  style={{
                                    fontSize: "0.9rem",
                                    color: "#fff",
                                  }}
                                >
                                  {p.contactInfo}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Testimonials View */}
            {activeTab === "testimonials" && (
              <div className="admin-tab-content">
                <AdminTestimonials />
              </div>
            )}

            {/* Blog Management View */}
            {activeTab === "blog" && (
              <div className="admin-tab-content">
                <AdminBlog onNavigate={onNavigate} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
