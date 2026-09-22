"use client";

/**
 * AdminBlog — WordPress-style blog management admin component.
 *
 * Two main views:
 *   • Dashboard — 8 stat cards + filters + bulk-action bar + sortable article table
 *   • Editor    — full-page article create/edit with TipTap BlogEditor + right sidebar
 *     (publish / categories / tags / featured image / author / SEO / social panels)
 *
 * All API requests target /api/blog* routes defined in Task 4.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";
import { BlogEditor } from "../admin/BlogEditor";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface AdminBlogProps {
  onNavigate: (path: string) => void;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  author: string;
  authorBio: string;
  authorAvatar: string;
  categoryId: number | null;
  category?: { id: number; name: string; slug: string } | null;
  tags: string[];
  status: string;
  sortOrder: number | null;
  views: number;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robotsMeta: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalArticles: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  trash: number;
  totalViews: number;
  categories: number;
  tags: number;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  author: string;
  authorBio: string;
  authorAvatar: string;
  categoryId: number | null;
  tags: string[];
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robotsMeta: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverAlt: "",
  author: "ElevateEdge Digital",
  authorBio: "",
  authorAvatar: "",
  categoryId: null,
  tags: [],
  status: "draft",
  publishedAt: null,
  scheduledAt: null,
  seoTitle: "",
  seoDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
  robotsMeta: "index,follow",
};

const STAT_CARDS: {
  key: keyof DashboardStats;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: "totalArticles", label: "Total Articles", icon: "fa-file-text", color: "var(--primary)" },
  { key: "published", label: "Published", icon: "fa-check-circle", color: "#22c55e" },
  { key: "draft", label: "Draft", icon: "fa-edit", color: "#f59e0b" },
  { key: "scheduled", label: "Scheduled", icon: "fa-clock", color: "#3b82f6" },
  { key: "archived", label: "Archived", icon: "fa-archive", color: "#9ca3af" },
  { key: "totalViews", label: "Total Views", icon: "fa-eye", color: "var(--primary)" },
  { key: "categories", label: "Categories", icon: "fa-folder", color: "var(--primary)" },
  { key: "tags", label: "Tags", icon: "fa-tags", color: "var(--primary)" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "—";
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function statusBadge(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case "published":
      return { bg: "rgba(34, 197, 94, 0.18)", color: "#22c55e", label: "Published" };
    case "draft":
      return { bg: "rgba(245, 158, 11, 0.18)", color: "#f59e0b", label: "Draft" };
    case "scheduled":
      return { bg: "rgba(59, 130, 246, 0.18)", color: "#3b82f6", label: "Scheduled" };
    case "archived":
      return { bg: "rgba(107, 114, 128, 0.2)", color: "#9ca3af", label: "Archived" };
    case "trash":
      return { bg: "rgba(239, 68, 68, 0.18)", color: "#ef4444", label: "Trash" };
    default:
      return {
        bg: "rgba(168, 85, 247, 0.15)",
        color: "var(--primary-light)",
        label: status,
      };
  }
}

function formsEqual(a: FormState, b: FormState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/* ------------------------------------------------------------------ */
/* Shared inline style fragments                                      */
/* ------------------------------------------------------------------ */

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "20px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "var(--text)",
  fontSize: "0.9rem",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  color: "var(--text-muted)",
  marginBottom: "4px",
  marginTop: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontWeight: 600,
};

const panelHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.85rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--text-heading)",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};

const actionBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  color: "var(--text-muted)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: 4,
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
  padding: "6px",
  minWidth: 200,
  zIndex: 20,
  display: "flex",
  flexDirection: "column",
};

const menuItemStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "8px 12px",
  fontSize: "0.85rem",
  color: "var(--text)",
  cursor: "pointer",
  textAlign: "left",
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const mutedStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--text-muted)",
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminBlog({ onNavigate }: AdminBlogProps) {
  useScrollReveal();

  /* ----------------------------- state ---------------------------- */
  const [view, setView] = useState<"dashboard" | "editor">("dashboard");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Selection & menu
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  // Loading
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingEditor, setLoadingEditor] = useState(false);

  // Editor status
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [scheduleInput, setScheduleInput] = useState("");

  // Dirty tracking via refs
  const formRef = useRef<FormState>(EMPTY_FORM);
  const lastSavedRef = useRef<FormState>(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  /* --------------------------- data loads ------------------------- */

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/blog/dashboard");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/blog/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const loadTags = useCallback(async () => {
    try {
      const res = await fetch("/api/blog/tags");
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error("Failed to load tags:", err);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const params = new URLSearchParams();
      params.set("admin", "1");
      // status filter (default to "all" in admin mode)
      params.set("status", filterStatus || "all");
      if (searchQuery) params.set("search", searchQuery);
      if (filterCategory) params.set("category", filterCategory);
      // sort
      if (sortBy === "newest") {
        params.set("orderby", "createdAt");
        params.set("order", "desc");
      } else if (sortBy === "oldest") {
        params.set("orderby", "createdAt");
        params.set("order", "asc");
      } else if (sortBy === "views") {
        params.set("orderby", "views");
        params.set("order", "desc");
      }
      // sortBy === "title" — sort client-side below
      const res = await fetch(`/api/blog?${params.toString()}`);
      const data = await res.json();
      let items: BlogPost[] = (data && data.items) || [];
      if (sortBy === "title") {
        items = [...items].sort((a, b) => a.title.localeCompare(b.title));
      }
      setPosts(items);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [filterStatus, searchQuery, filterCategory, sortBy]);

  const loadPost = useCallback(async (id: number) => {
    setLoadingEditor(true);
    setStatusMsg("");
    try {
      const res = await fetch(`/api/blog/${id}?admin=1`);
      if (!res.ok) throw new Error("Failed to load");
      const post: BlogPost = await res.json();
      const newForm: FormState = {
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        coverImage: post.coverImage || "",
        coverAlt: post.coverAlt || "",
        author: post.author || "ElevateEdge Digital",
        authorBio: post.authorBio || "",
        authorAvatar: post.authorAvatar || "",
        categoryId: post.categoryId ?? null,
        tags: post.tags || [],
        status: post.status || "draft",
        publishedAt: post.publishedAt || null,
        scheduledAt: post.scheduledAt || null,
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        focusKeyword: post.focusKeyword || "",
        canonicalUrl: post.canonicalUrl || "",
        ogTitle: post.ogTitle || "",
        ogDescription: post.ogDescription || "",
        ogImage: post.ogImage || "",
        twitterTitle: post.twitterTitle || "",
        twitterDescription: post.twitterDescription || "",
        twitterImage: post.twitterImage || "",
        robotsMeta: post.robotsMeta || "index,follow",
      };
      setForm(newForm);
      formRef.current = newForm;
      lastSavedRef.current = newForm;
      setSlugEdited(true); // existing post has a slug already
      setDirty(false);
      setScheduleInput(isoToLocalInput(post.scheduledAt));
      // approximate word/char count from existing content
      const text = (post.content || "").replace(/<[^>]+>/g, " ").trim();
      const wc = text ? text.split(/\s+/).length : 0;
      setWordCount(wc);
      setCharCount((post.content || "").length);
    } catch (err) {
      console.error("Failed to load post:", err);
      setStatusMsg("Failed to load post.");
    } finally {
      setLoadingEditor(false);
    }
  }, []);

  /* --------------------------- side effects ----------------------- */

  // Initial dashboard / categories / tags load
  useEffect(() => {
    loadDashboard();
    loadCategories();
    loadTags();
  }, [loadDashboard, loadCategories, loadTags]);

  // Reload posts whenever filters change
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Debounce search input → searchQuery
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Warn user before navigating away with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Autosave every 30s if content changed (only in editor view with an id)
  useEffect(() => {
    if (view !== "editor" || !editId) return;
    const interval = setInterval(async () => {
      const current = formRef.current;
      if (formsEqual(current, lastSavedRef.current)) return;
      setSavingStatus("saving");
      try {
        const res = await fetch(`/api/blog/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-editor": "admin",
          },
          body: JSON.stringify(current),
        });
        if (!res.ok) throw new Error("Autosave failed");
        const saved: BlogPost = await res.json();
        // Sync server-side changes (slug uniqueness, dates)
        const synced: FormState = {
          ...current,
          slug: saved.slug,
          publishedAt: saved.publishedAt,
          scheduledAt: saved.scheduledAt,
          status: saved.status,
        };
        formRef.current = synced;
        lastSavedRef.current = synced;
        // Only update form state if user hasn't typed more during request
        setForm((prev) => (formsEqual(prev, current) ? synced : prev));
        setDirty(false);
        setSavingStatus("saved");
        setLastSavedAt(formatTime(new Date()));
        loadDashboard();
      } catch (err) {
        console.error("Autosave failed:", err);
        setSavingStatus("idle");
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [view, editId, loadDashboard]);

  /* --------------------------- form helpers ----------------------- */

  function updateForm(patch: Partial<FormState>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      formRef.current = next;
      const isDirty = !formsEqual(next, lastSavedRef.current);
      setDirty(isDirty);
      return next;
    });
  }

  function handleTitleChange(title: string) {
    setForm((prev) => {
      const next = {
        ...prev,
        title,
        slug: slugEdited ? prev.slug : slugify(title),
      };
      formRef.current = next;
      setDirty(!formsEqual(next, lastSavedRef.current));
      return next;
    });
  }

  function handleSlugChange(slug: string) {
    setSlugEdited(true);
    setForm((prev) => {
      const next = { ...prev, slug };
      formRef.current = next;
      setDirty(!formsEqual(next, lastSavedRef.current));
      return next;
    });
  }

  /* --------------------------- navigation -------------------------- */

  function newArticle() {
    setForm(EMPTY_FORM);
    formRef.current = EMPTY_FORM;
    lastSavedRef.current = EMPTY_FORM;
    setEditId(null);
    setSlugEdited(false);
    setDirty(false);
    setStatusMsg("");
    setSavingStatus("idle");
    setLastSavedAt(null);
    setScheduleInput("");
    setWordCount(0);
    setCharCount(0);
    setView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editArticle(id: number) {
    setView("editor");
    setEditId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadPost(id);
  }

  function backToDashboard() {
    if (
      dirty &&
      !window.confirm("You have unsaved changes. Leave the editor anyway?")
    )
      return;
    setView("dashboard");
    setEditId(null);
    setForm(EMPTY_FORM);
    formRef.current = EMPTY_FORM;
    lastSavedRef.current = EMPTY_FORM;
    setDirty(false);
    setSlugEdited(false);
    setSavingStatus("idle");
    setLastSavedAt(null);
    setStatusMsg("");
    setScheduleInput("");
    setWordCount(0);
    setCharCount(0);
    loadDashboard();
    loadPosts();
  }

  /* --------------------------- persist ---------------------------- */

  async function persistPost(
    nextForm: FormState,
    mode: "draft" | "publish" | "schedule" | "autosave" | "unpublish"
  ) {
    setStatusMsg("");
    if (mode !== "autosave") setSavingStatus("saving");
    try {
      const payload = { ...nextForm };
      let res: Response;
      if (editId) {
        res = await fetch(`/api/blog/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-editor": "admin",
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save");
      }
      const saved: BlogPost = await res.json();
      // Sync form with server-side changes
      const synced: FormState = {
        ...nextForm,
        slug: saved.slug,
        publishedAt: saved.publishedAt,
        scheduledAt: saved.scheduledAt,
        status: saved.status,
      };
      // If newly created, capture id
      if (!editId && saved.id) {
        setEditId(saved.id);
      }
      setForm(synced);
      formRef.current = synced;
      lastSavedRef.current = synced;
      setDirty(false);
      setSavingStatus("saved");
      setLastSavedAt(formatTime(new Date()));
      if (mode === "publish") setStatusMsg("Article published.");
      else if (mode === "schedule") setStatusMsg("Article scheduled.");
      else if (mode === "draft") setStatusMsg("Draft saved.");
      else if (mode === "unpublish") setStatusMsg("Article unpublished.");
      loadDashboard();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMsg(msg);
      setSavingStatus("idle");
    }
  }

  function saveDraft() {
    persistPost({ ...formRef.current, status: "draft" }, "draft");
  }

  function publishNow() {
    if (!formRef.current.title.trim()) {
      setStatusMsg("Please enter a title before publishing.");
      return;
    }
    const now = new Date().toISOString();
    persistPost(
      { ...formRef.current, status: "published", publishedAt: now },
      "publish"
    );
  }

  function unpublish() {
    persistPost({ ...formRef.current, status: "draft" }, "unpublish");
  }

  function schedulePost() {
    if (!scheduleInput) {
      setStatusMsg("Please pick a date and time to schedule.");
      return;
    }
    const scheduledAt = new Date(scheduleInput).toISOString();
    persistPost(
      { ...formRef.current, status: "scheduled", scheduledAt },
      "schedule"
    );
  }

  function previewCurrent() {
    if (formRef.current.status !== "published") {
      window.alert("Preview is only available for published articles.");
      return;
    }
    const slug = formRef.current.slug;
    if (!slug) {
      window.alert("Save the article first — no slug yet.");
      return;
    }
    window.open(`${window.location.origin}/#/blog/${slug}`, "_blank");
  }

  async function deleteCurrent() {
    if (!editId) return;
    if (
      !window.confirm(
        'Move this article to trash? You can permanently delete it from the dashboard later.'
      )
    )
      return;
    try {
      await fetch(`/api/blog/${editId}`, { method: "DELETE" });
      backToDashboard();
    } catch (err) {
      console.error("Delete failed:", err);
      setStatusMsg("Failed to delete.");
    }
  }

  /* --------------------------- list actions ----------------------- */

  function previewPost(post: BlogPost) {
    if (post.status !== "published") {
      window.alert("Preview is only available for published articles.");
      return;
    }
    window.open(`${window.location.origin}/#/blog/${post.slug}`, "_blank");
  }

  async function duplicatePost(post: BlogPost) {
    if (!window.confirm(`Duplicate "${post.title}"?`)) return;
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${post.title} (Copy)`,
          slug: `${post.slug}-copy`,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          coverAlt: post.coverAlt,
          author: post.author,
          authorBio: post.authorBio,
          authorAvatar: post.authorAvatar,
          categoryId: post.categoryId,
          tags: post.tags,
          status: "draft",
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          focusKeyword: post.focusKeyword,
          canonicalUrl: post.canonicalUrl,
          ogTitle: post.ogTitle,
          ogDescription: post.ogDescription,
          ogImage: post.ogImage,
          twitterTitle: post.twitterTitle,
          twitterDescription: post.twitterDescription,
          twitterImage: post.twitterImage,
          robotsMeta: post.robotsMeta,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      await loadPosts();
      loadDashboard();
    } catch (err) {
      console.error("Failed to duplicate:", err);
    }
  }

  async function togglePublish(post: BlogPost) {
    const newStatus = post.status === "published" ? "draft" : "published";
    const verb = newStatus === "published" ? "Publish" : "Unpublish";
    if (!window.confirm(`${verb} "${post.title}"?`)) return;
    try {
      const payload: Record<string, unknown> = { status: newStatus };
      if (newStatus === "published") {
        payload.publishedAt = new Date().toISOString();
      }
      await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadPosts();
      loadDashboard();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
    }
  }

  async function moveToDraft(post: BlogPost) {
    try {
      await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      await loadPosts();
      loadDashboard();
    } catch (err) {
      console.error("Failed to move to draft:", err);
    }
  }

  async function scheduleFromList(post: BlogPost) {
    const defaultInput = isoToLocalInput(post.scheduledAt || new Date().toISOString());
    const input = window.prompt(
      "Schedule for (YYYY-MM-DDTHH:MM, local time):",
      defaultInput
    );
    if (!input) return;
    const dt = new Date(input);
    if (isNaN(dt.getTime())) {
      window.alert("Invalid date format.");
      return;
    }
    try {
      await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "scheduled",
          scheduledAt: dt.toISOString(),
        }),
      });
      await loadPosts();
      loadDashboard();
    } catch (err) {
      console.error("Failed to schedule:", err);
    }
  }

  async function deletePost(post: BlogPost) {
    const isTrash = post.status === "trash";
    const msg = isTrash
      ? `Permanently delete "${post.title}"? This cannot be undone.`
      : `Move "${post.title}" to trash?`;
    if (!window.confirm(msg)) return;
    try {
      await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
      await loadPosts();
      loadDashboard();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  /* --------------------------- bulk actions ----------------------- */

  function toggleSelectAll() {
    if (posts.length > 0 && selectedIds.size === posts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkAction(action: "publish" | "draft" | "delete") {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const verb =
      action === "publish"
        ? "Publish"
        : action === "draft"
        ? "Move to draft"
        : "Delete";
    if (!window.confirm(`${verb} ${ids.length} selected article(s)?`)) return;
    try {
      await Promise.all(
        ids.map((id) => {
          if (action === "delete") {
            return fetch(`/api/blog/${id}`, { method: "DELETE" });
          }
          const payload: Record<string, unknown> = {
            status: action === "publish" ? "published" : "draft",
          };
          if (action === "publish") {
            payload.publishedAt = new Date().toISOString();
          }
          return fetch(`/api/blog/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        })
      );
      setSelectedIds(new Set());
      await loadPosts();
      loadDashboard();
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  }

  /* --------------------------- categories quick add --------------- */

  async function quickAddCategory() {
    const name = window.prompt("New category name:");
    if (!name || !name.trim()) return;
    try {
      const res = await fetch("/api/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      await loadCategories();
      loadDashboard();
    } catch (err) {
      console.error("Failed to create category:", err);
      window.alert("Failed to create category.");
    }
  }

  /* ====================== DASHBOARD RENDER ======================== */

  function renderDashboard() {
    return (
      <div>
        {/* Stats cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {STAT_CARDS.map((card) => {
            const value = stats ? stats[card.key] ?? 0 : 0;
            return (
              <div key={card.key} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: card.color,
                      color: "#fff",
                      fontSize: "1.15rem",
                      flexShrink: 0,
                    }}
                  >
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "var(--text-heading)",
                        lineHeight: 1.1,
                      }}
                    >
                      {value}
                    </div>
                    <div style={mutedStyle}>{card.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters row */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: "1 1 220px",
              minWidth: 200,
              position: "relative",
            }}
          >
            <i
              className="fas fa-search"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            ></i>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, excerpt, or content…"
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ ...inputStyle, flex: "0 1 180px" }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, flex: "0 1 160px" }}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
            <option value="trash">Trash</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ ...inputStyle, flex: "0 1 160px" }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Viewed</option>
            <option value="title">Title A-Z</option>
          </select>
          <button
            className="btn btn-primary"
            style={{ padding: "8px 18px", fontSize: "0.85rem" }}
            onClick={newArticle}
          >
            <i className="fas fa-plus"></i> Add New Article
          </button>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div
            style={{
              marginBottom: "16px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--text-heading)" }}>
              {selectedIds.size} selected
            </span>
            <button
              className="btn btn-primary"
              style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              onClick={() => bulkAction("publish")}
            >
              <i className="fas fa-rocket"></i> Bulk Publish
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              onClick={() => bulkAction("draft")}
            >
              <i className="fas fa-file"></i> Bulk Draft
            </button>
            <button
              className="btn btn-outline"
              style={{
                padding: "6px 14px",
                fontSize: "0.82rem",
                color: "#ef4444",
                borderColor: "#ef4444",
              }}
              onClick={() => bulkAction("delete")}
            >
              <i className="fas fa-trash"></i> Bulk Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Articles table */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--bg-surface)",
                    borderBottom: "1px solid var(--border)",
                    textAlign: "left",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "12px", width: 36 }}>
                    <input
                      type="checkbox"
                      checked={
                        posts.length > 0 &&
                        selectedIds.size === posts.length
                      }
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th style={{ padding: "12px" }}>Thumbnail</th>
                  <th style={{ padding: "12px" }}>Title</th>
                  <th style={{ padding: "12px" }}>Author</th>
                  <th style={{ padding: "12px" }}>Category</th>
                  <th style={{ padding: "12px" }}>Tags</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Published</th>
                  <th style={{ padding: "12px" }}>Views</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingPosts ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <i className="fas fa-spinner fa-spin"></i> Loading…
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No articles found. Click{" "}
                      <strong>Add New Article</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => {
                    const sb = statusBadge(post.status);
                    const checked = selectedIds.has(post.id);
                    return (
                      <tr
                        key={post.id}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: checked
                            ? "rgba(168, 85, 247, 0.06)"
                            : "transparent",
                        }}
                      >
                        <td style={{ padding: "12px" }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(post.id)}
                            aria-label={`Select ${post.title}`}
                          />
                        </td>
                        <td style={{ padding: "12px" }}>
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.coverAlt || post.title}
                              style={{
                                width: 60,
                                height: 40,
                                objectFit: "cover",
                                borderRadius: 4,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 60,
                                height: 40,
                                background: "var(--bg-surface)",
                                borderRadius: 4,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--text-muted)",
                              }}
                            >
                              <i className="fas fa-image"></i>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={() => editArticle(post.id)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              color: "var(--text)",
                              fontWeight: 600,
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: "0.9rem",
                            }}
                            title="Edit article"
                          >
                            {post.title || "(untitled)"}
                          </button>
                          <div style={mutedStyle}>/{post.slug}</div>
                        </td>
                        <td style={{ padding: "12px", color: "var(--text)" }}>
                          {post.author}
                        </td>
                        <td style={{ padding: "12px", color: "var(--text)" }}>
                          {post.category?.name || "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {(post.tags || []).slice(0, 3).join(", ") ||
                            "—"}
                          {post.tags && post.tags.length > 3 && (
                            <span
                              style={{ marginLeft: 4 }}
                              title={post.tags.slice(3).join(", ")}
                            >
                              +{post.tags.length - 3}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              background: sb.bg,
                              color: sb.color,
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {sb.label}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatDate(post.publishedAt)}
                        </td>
                        <td style={{ padding: "12px", color: "var(--text)" }}>
                          {post.views}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            position: "relative",
                            textAlign: "right",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(
                                openMenu === post.id ? null : post.id
                              );
                            }}
                            style={actionBtnStyle}
                            aria-label="Actions"
                          >
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                          {openMenu === post.id && (
                            <>
                              <div
                                onClick={() => setOpenMenu(null)}
                                style={{
                                  position: "fixed",
                                  inset: 0,
                                  zIndex: 5,
                                }}
                              />
                              <div style={dropdownStyle}>
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    editArticle(post.id);
                                  }}
                                  style={menuItemStyle}
                                >
                                  <i
                                    className="fas fa-edit"
                                    style={{ width: 16 }}
                                  ></i>{" "}
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    previewPost(post);
                                  }}
                                  style={menuItemStyle}
                                >
                                  <i
                                    className="fas fa-external-link-alt"
                                    style={{ width: 16 }}
                                  ></i>{" "}
                                  Preview
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    duplicatePost(post);
                                  }}
                                  style={menuItemStyle}
                                >
                                  <i
                                    className="fas fa-copy"
                                    style={{ width: 16 }}
                                  ></i>{" "}
                                  Duplicate
                                </button>
                                {post.status === "published" ? (
                                  <button
                                    onClick={() => {
                                      setOpenMenu(null);
                                      togglePublish(post);
                                    }}
                                    style={menuItemStyle}
                                  >
                                    <i
                                      className="fas fa-eye-slash"
                                      style={{ width: 16 }}
                                    ></i>{" "}
                                    Unpublish
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setOpenMenu(null);
                                      togglePublish(post);
                                    }}
                                    style={menuItemStyle}
                                  >
                                    <i
                                      className="fas fa-rocket"
                                      style={{ width: 16 }}
                                    ></i>{" "}
                                    Publish
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    moveToDraft(post);
                                  }}
                                  style={menuItemStyle}
                                >
                                  <i
                                    className="fas fa-file"
                                    style={{ width: 16 }}
                                  ></i>{" "}
                                  Move to Draft
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    scheduleFromList(post);
                                  }}
                                  style={menuItemStyle}
                                >
                                  <i
                                    className="fas fa-clock"
                                    style={{ width: 16 }}
                                  ></i>{" "}
                                  Schedule
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenMenu(null);
                                    deletePost(post);
                                  }}
                                  style={{
                                    ...menuItemStyle,
                                    color: "#ef4444",
                                  }}
                                >
                                  <i
                                    className="fas fa-trash"
                                    style={{ width: 16 }}
                                  ></i>{" "}
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ======================== EDITOR RENDER ========================= */

  function renderEditor() {
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return (
      <div>
        {/* Top toolbar */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-outline"
              style={{ padding: "8px 14px", fontSize: "0.85rem" }}
              onClick={backToDashboard}
            >
              <i className="fas fa-arrow-left"></i> Dashboard
            </button>
            <h3
              style={{
                margin: 0,
                color: "var(--text-heading)",
                fontSize: "1.2rem",
              }}
            >
              {editId ? "Edit Article" : "New Article"}
              {loadingEditor && (
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ marginLeft: 10, color: "var(--text-muted)" }}
                ></i>
              )}
            </h3>
            {savingStatus === "saving" && (
              <span style={mutedStyle}>
                <i className="fas fa-sync fa-spin"></i> Saving…
              </span>
            )}
            {savingStatus === "saved" && lastSavedAt && (
              <span style={mutedStyle}>
                <i className="fas fa-check"></i> Saved at {lastSavedAt}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              onClick={saveDraft}
            >
              <i className="fas fa-save"></i> Save Draft
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              onClick={previewCurrent}
            >
              <i className="fas fa-eye"></i> Preview
            </button>
            {form.status === "published" ? (
              <button
                className="btn btn-outline"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                onClick={unpublish}
              >
                <i className="fas fa-eye-slash"></i> Unpublish
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                onClick={publishNow}
              >
                <i className="fas fa-rocket"></i> Publish
              </button>
            )}
            <button
              className="btn btn-outline"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              onClick={schedulePost}
            >
              <i className="fas fa-clock"></i> Schedule
            </button>
            {editId && (
              <button
                className="btn btn-outline"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  color: "#ef4444",
                  borderColor: "#ef4444",
                }}
                onClick={deleteCurrent}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            )}
          </div>
        </div>

        {/* Editor layout: main + sidebar */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Main editor column */}
          <div
            style={{
              flex: "1 1 65%",
              minWidth: 320,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Title + slug */}
            <div style={cardStyle}>
              <input
                placeholder="Article title…"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--text-heading)",
                  fontFamily: "inherit",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <i
                  className="fas fa-link"
                  style={{ color: "var(--text-muted)" }}
                ></i>
                <span style={{ color: "var(--text-muted)" }}>/blog/</span>
                <input
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="article-slug"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text)",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                  }}
                />
                {slugEdited && (
                  <button
                    onClick={() => {
                      setSlugEdited(false);
                      handleTitleChange(form.title);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                    title="Regenerate slug from title"
                  >
                    <i className="fas fa-redo"></i> Auto
                  </button>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div style={cardStyle}>
              <label style={labelStyle}>Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => updateForm({ excerpt: e.target.value })}
                placeholder="Short summary shown on blog cards and search results…"
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Featured image (top preview) */}
            <div style={cardStyle}>
              <label style={labelStyle}>Featured Image URL</label>
              <input
                value={form.coverImage}
                onChange={(e) => updateForm({ coverImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                style={inputStyle}
              />
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt={form.coverAlt || form.title}
                  style={{
                    width: "100%",
                    maxHeight: 240,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                />
              )}
            </div>

            {/* Content / TipTap editor */}
            <div style={cardStyle}>
              <label style={labelStyle}>Content</label>
              <BlogEditor
                value={form.content}
                onChange={(html) => updateForm({ content: html })}
                onWordCountChange={setWordCount}
                onCharCountChange={setCharCount}
              />
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  <i className="fas fa-font"></i> {wordCount} words
                </span>
                <span>
                  <i className="fas fa-text-width"></i> {charCount} characters
                </span>
                <span>
                  <i className="far fa-clock"></i> ~{readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside
            style={{
              flex: "0 0 320px",
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "sticky",
              top: 20,
            }}
          >
            {/* Publish panel */}
            <div style={cardStyle}>
              <h4 style={panelHeadingStyle}>
                <i className="fas fa-rocket" style={{ color: "var(--primary)" }}></i>
                Publish
              </h4>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateForm({ status: e.target.value })}
                style={inputStyle}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
                <option value="trash">Trash</option>
              </select>
              {form.publishedAt && (
                <div style={{ ...mutedStyle, marginTop: 8 }}>
                  Published: {formatDate(form.publishedAt)}
                </div>
              )}
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "8px 12px", fontSize: "0.82rem" }}
                  onClick={publishNow}
                >
                  Publish
                </button>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1, padding: "8px 12px", fontSize: "0.82rem" }}
                  onClick={saveDraft}
                >
                  Save Draft
                </button>
              </div>
              <label style={labelStyle}>Schedule</label>
              <input
                type="datetime-local"
                value={scheduleInput}
                onChange={(e) => setScheduleInput(e.target.value)}
                style={inputStyle}
              />
              <button
                className="btn btn-outline"
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "8px 12px",
                  fontSize: "0.82rem",
                }}
                onClick={schedulePost}
              >
                <i className="fas fa-clock"></i> Schedule
              </button>
              {statusMsg && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    background: "rgba(168, 85, 247, 0.1)",
                    color: "var(--primary-light)",
                    borderRadius: 6,
                    fontSize: "0.82rem",
                  }}
                >
                  {statusMsg}
                </div>
              )}
              {(savingStatus === "saving" || lastSavedAt) && (
                <div style={{ ...mutedStyle, marginTop: 8 }}>
                  {savingStatus === "saving"
                    ? "Saving…"
                    : `Saved at ${lastSavedAt}`}
                </div>
              )}
            </div>

            {/* Categories panel */}
            <div style={cardStyle}>
              <h4 style={panelHeadingStyle}>
                <i className="fas fa-folder" style={{ color: "var(--primary)" }}></i>
                Category
              </h4>
              <select
                value={form.categoryId ?? ""}
                onChange={(e) =>
                  updateForm({
                    categoryId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                style={inputStyle}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {typeof c.postCount === "number"
                      ? ` (${c.postCount})`
                      : ""}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-outline"
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "8px 12px",
                  fontSize: "0.82rem",
                }}
                onClick={quickAddCategory}
              >
                <i className="fas fa-plus"></i> New Category
              </button>
            </div>

            {/* Tags panel */}
            <div style={cardStyle}>
              <h4 style={panelHeadingStyle}>
                <i className="fas fa-tags" style={{ color: "var(--primary)" }}></i>
                Tags
              </h4>
              <input
                value={form.tags.join(", ")}
                onChange={(e) =>
                  updateForm({
                    tags: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="comma, separated, tags"
                style={inputStyle}
              />
              {tags.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {tags.slice(0, 15).map((t) => {
                    const active = form.tags.includes(t.name);
                    return (
                      <button
                        key={t.id}
                        onClick={() =>
                          updateForm({
                            tags: active
                              ? form.tags.filter((x) => x !== t.name)
                              : [...form.tags, t.name],
                          })
                        }
                        style={{
                          background: active
                            ? "var(--primary)"
                            : "var(--bg-surface)",
                          color: active ? "#fff" : "var(--text-muted)",
                          border: "1px solid var(--border)",
                          borderRadius: 999,
                          padding: "3px 10px",
                          fontSize: "0.72rem",
                          cursor: "pointer",
                        }}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Featured image panel */}
            <div style={cardStyle}>
              <h4 style={panelHeadingStyle}>
                <i className="fas fa-image" style={{ color: "var(--primary)" }}></i>
                Featured Image
              </h4>
              <label style={labelStyle}>URL</label>
              <input
                value={form.coverImage}
                onChange={(e) => updateForm({ coverImage: e.target.value })}
                placeholder="https://…"
                style={inputStyle}
              />
              <label style={labelStyle}>Alt Text</label>
              <input
                value={form.coverAlt}
                onChange={(e) => updateForm({ coverAlt: e.target.value })}
                placeholder="Describe the image for screen readers…"
                style={inputStyle}
              />
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt={form.coverAlt || form.title}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    borderRadius: 8,
                    maxHeight: 160,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            {/* Author panel */}
            <div style={cardStyle}>
              <h4 style={panelHeadingStyle}>
                <i className="fas fa-user-circle" style={{ color: "var(--primary)" }}></i>
                Author
              </h4>
              <label style={labelStyle}>Name</label>
              <input
                value={form.author}
                onChange={(e) => updateForm({ author: e.target.value })}
                style={inputStyle}
              />
              <label style={labelStyle}>Bio</label>
              <textarea
                value={form.authorBio}
                onChange={(e) => updateForm({ authorBio: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
              <label style={labelStyle}>Avatar URL</label>
              <input
                value={form.authorAvatar}
                onChange={(e) => updateForm({ authorAvatar: e.target.value })}
                placeholder="https://…"
                style={inputStyle}
              />
              {form.authorAvatar && (
                <img
                  src={form.authorAvatar}
                  alt={form.author}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    marginTop: 10,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            {/* SEO panel */}
            <details style={cardStyle}>
              <summary style={panelHeadingStyle}>
                <i className="fas fa-search" style={{ color: "var(--primary)" }}></i>
                SEO
              </summary>
              <label style={labelStyle}>SEO Title</label>
              <input
                value={form.seoTitle}
                onChange={(e) => updateForm({ seoTitle: e.target.value })}
                style={inputStyle}
              />
              <label style={labelStyle}>Meta Description</label>
              <textarea
                value={form.seoDescription}
                onChange={(e) =>
                  updateForm({ seoDescription: e.target.value })
                }
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
              <label style={labelStyle}>Focus Keyword</label>
              <input
                value={form.focusKeyword}
                onChange={(e) => updateForm({ focusKeyword: e.target.value })}
                style={inputStyle}
              />
              <label style={labelStyle}>Canonical URL</label>
              <input
                value={form.canonicalUrl}
                onChange={(e) => updateForm({ canonicalUrl: e.target.value })}
                placeholder="https://…"
                style={inputStyle}
              />
              <label style={labelStyle}>Robots</label>
              <select
                value={form.robotsMeta}
                onChange={(e) => updateForm({ robotsMeta: e.target.value })}
                style={inputStyle}
              >
                <option value="index,follow">index, follow</option>
                <option value="noindex,nofollow">noindex, nofollow</option>
                <option value="index,nofollow">index, nofollow</option>
                <option value="noindex,follow">noindex, follow</option>
              </select>
            </details>

            {/* Social panel */}
            <details style={cardStyle}>
              <summary style={panelHeadingStyle}>
                <i className="fas fa-share-alt" style={{ color: "var(--primary)" }}></i>
                Social — Open Graph & Twitter
              </summary>
              <label style={labelStyle}>OG Title</label>
              <input
                value={form.ogTitle}
                onChange={(e) => updateForm({ ogTitle: e.target.value })}
                style={inputStyle}
              />
              <label style={labelStyle}>OG Description</label>
              <textarea
                value={form.ogDescription}
                onChange={(e) =>
                  updateForm({ ogDescription: e.target.value })
                }
                rows={2}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
              <label style={labelStyle}>OG Image URL</label>
              <input
                value={form.ogImage}
                onChange={(e) => updateForm({ ogImage: e.target.value })}
                placeholder="https://…"
                style={inputStyle}
              />
              <label style={labelStyle}>Twitter Title</label>
              <input
                value={form.twitterTitle}
                onChange={(e) => updateForm({ twitterTitle: e.target.value })}
                style={inputStyle}
              />
              <label style={labelStyle}>Twitter Description</label>
              <textarea
                value={form.twitterDescription}
                onChange={(e) =>
                  updateForm({ twitterDescription: e.target.value })
                }
                rows={2}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
              <label style={labelStyle}>Twitter Image URL</label>
              <input
                value={form.twitterImage}
                onChange={(e) =>
                  updateForm({ twitterImage: e.target.value })
                }
                placeholder="https://…"
                style={inputStyle}
              />
            </details>
          </aside>
        </div>
      </div>
    );
  }

  /* ============================== ROOT ============================ */

  if (view === "editor") {
    return <div style={{ padding: "0 0 40px" }}>{renderEditor()}</div>;
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
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
        <h3
          style={{
            margin: 0,
            color: "var(--text-heading)",
            fontSize: "1.3rem",
          }}
        >
          <i className="fas fa-blog" style={{ color: "var(--primary)" }}></i>{" "}
          Blog Management
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-outline"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
            onClick={() => {
              loadDashboard();
              loadPosts();
            }}
          >
            <i className="fas fa-sync"></i> Refresh
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
            onClick={() => onNavigate("/blog")}
          >
            <i className="fas fa-external-link-alt"></i> View Blog
          </button>
        </div>
      </div>
      {renderDashboard()}
    </div>
  );
}
