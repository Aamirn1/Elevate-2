---
Task ID: 7
Agent: AdminBlog Component Agent
Task: Build WordPress-style blog management admin component (AdminBlog.tsx)

Work Log:
- Read /home/z/my-project/worklog.md to understand prior context (full Elevate-Edge migration, TipTap v3.31.3 installed Task 2b, blog API routes built Task 4, BlogEditor TipTap component built Task 8 with 19 extensions + sticky toolbar)
- Inspected existing AdminPage.tsx — confirmed `import { AdminBlog } from "./AdminBlog"` already in place at line 6, and AdminBlog is rendered inside `admin-tab-content` div when activeTab === "blog". Dev server was failing with "Module not found: Can't resolve './AdminBlog'" because file didn't exist yet — creating it unblocks the build.
- Inspected BlogEditor.tsx — confirmed exported `BlogEditorProps` interface: `value`, `onChange`, `onWordCountChange?`, `onCharCountChange?`, `placeholder?`. Component is named export `export function BlogEditor` and is a "use client" component.
- Inspected blog API routes to confirm request/response shapes:
  * GET /api/blog?admin=1&status=all&search=&category=&orderby=createdAt&order=desc returns `{ items: BlogPost[], total }`. Items include `category: { id, name, slug }` and parsed `tags: string[]`.
  * GET /api/blog/dashboard returns `{ totalArticles, published, draft, scheduled, archived, trash, totalViews, categories, tags }`.
  * GET /api/blog/categories returns `[{ id, name, slug, postCount, ... }]` (flat array, sorted by sortOrder).
  * GET /api/blog/tags returns `[{ id, name, slug, ... }]` sorted by name.
  * GET /api/blog/{id}?admin=1 returns single post (no view increment).
  * POST /api/blog (create) — required: title. Returns created post with id, slug (auto-unique), readingTime, and parsed tags.
  * PUT /api/blog/{id} (update) — partial: only fields sent are updated; x-editor header captures editorName for revision. If title/content/excerpt changes, a BlogRevision is created.
  * DELETE /api/blog/{id} — soft delete (status=trash) on first call; permanent delete on second call (when already trash).
- Inspected Prisma BlogPost model to confirm field names (coverImage, coverAlt, author, authorBio, authorAvatar, seoTitle, seoDescription, focusKeyword, canonicalUrl, og*, twitter*, robotsMeta, publishedAt, scheduledAt, readingTime, views, sortOrder) — all 24 editable fields beyond id/timestamps.
- Inspected AdminTestimonials.tsx styling pattern — uses inline styles with CSS vars (`var(--bg-card)`, `var(--border)`, `var(--text-muted)`, etc.), `cardStyle`/`inputStyle`/`labelStyle` reusable style objects, `btn btn-primary` + `btn btn-outline` classes, Font Awesome icons.
- Confirmed eslint config: `react-hooks/exhaustive-deps` is OFF, `@typescript-eslint/no-explicit-any` is OFF, `@next/next/no-img-element` is OFF, `react-hooks/set-state-in-effect` is the only enforced rule.
- Created /home/z/my-project/src/components/elevate/pages/AdminBlog.tsx (~2100 lines, "use client" component) implementing the full WordPress-style blog management UI with two views:

  **Dashboard view**:
  * 8 stat cards (auto-fit responsive grid) using STAT_CARDS config: Total Articles (fa-file-text), Published (fa-check-circle green), Draft (fa-edit amber), Scheduled (fa-clock blue), Archived (fa-archive gray), Total Views (fa-eye), Categories (fa-folder), Tags (fa-tags). Each card: 46px colored icon tile + bold number + muted label.
  * Filters row: search input (with magnifier icon, debounced 300ms via useEffect+setTimeout), category dropdown (from /api/blog/categories), status dropdown (all/published/draft/scheduled/archived/trash), sort dropdown (newest/oldest/views/title — title sorted client-side since API doesn't support title sort), "Add New Article" primary button (calls newArticle() to switch to editor view with empty form).
  * Bulk-action bar (only visible when ≥1 row selected): "{N} selected" + Bulk Publish (sets status=published + publishedAt=now), Bulk Draft (status=draft), Bulk Delete (DELETE each id), Clear selection link.
  * Articles table with 10 columns: select-all checkbox, thumbnail (60×40 object-cover with placeholder), title (clickable button → editArticle(id); sub-line shows /slug), author, category.name, tags (first 3 comma-joined with "+N" overflow tooltip), status badge (color-coded pill), published date (toLocaleDateString), views, actions dropdown.
  * Actions dropdown (positioned absolute with fixed-position backdrop for outside-click-to-close): Edit, Preview (window.open /#/blog/slug if published else alert), Duplicate (POST with title+" (Copy)" + slug+"-copy" + status=draft), Publish/Unpublish toggle, Move to Draft, Schedule (window.prompt for datetime-local string → status=scheduled), Delete (window.confirm with soft/permanent messaging; calls DELETE).
  * Refresh button + View Blog link (onNavigate "/blog") in dashboard header.

  **Editor view** (full-width, two-column flex layout — main ~65% + sidebar 320px sticky):
  * Top toolbar: "← Dashboard" button (with dirty-confirm if unsaved), "Edit Article" / "New Article" heading with spinner during load, autosave indicator ("Saving…" / "Saved at HH:MM"), and Save Draft / Preview / Publish-or-Unpublish / Schedule / Delete (red) buttons.
  * Main column (top-down cards):
    - Title input (transparent, 1.8rem bold) + slug sub-row (with /blog/ prefix, monospace slug input, "Auto" reset button when slugEdited)
    - Excerpt textarea (3 rows, vertical resize)
    - Featured image URL input + image preview (max-height 240px object-cover)
    - **BlogEditor** (TipTap) with `value={form.content}` `onChange={(html) => updateForm({ content: html })}` `onWordCountChange={setWordCount}` `onCharCountChange={setCharCount}`. Below editor: word/char/reading-time footer ("N words • M characters • ~X min read" with readingTime = max(1, ceil(words/200))).
  * Right sidebar (sticky top:20px) — 7 panels:
    1. Publish — status dropdown (draft/published/scheduled/archived/trash), publishedAt read-only display, Publish + Save Draft buttons side-by-side, datetime-local input for Schedule + Schedule button, inline status message box (rgba primary tint), last-saved-at readout.
    2. Category — dropdown from categories (showing postCount), "New Category" button (quick window.prompt → POST /api/blog/categories).
    3. Tags — comma-separated input bound to form.tags array + clickable tag suggestion chips (first 15 tags from /api/blog/tags; click toggles tag in/out of form.tags with active purple highlight).
    4. Featured Image — URL + alt text + 48×48-style image preview.
    5. Author — name (default "ElevateEdge Digital"), bio textarea, avatar URL + 48px circular avatar preview.
    6. SEO (`<details>` collapsible) — SEO title, meta description textarea, focus keyword, canonical URL, robots select (index,follow / noindex,nofollow / etc.).
    7. Social (`<details>`) — OG title/desc/image + Twitter title/desc/image.

  **State & lifecycle**:
  * `view` ("dashboard" | "editor"), `editId`, `form` (FormState with all 24 editable fields), `slugEdited` flag.
  * `posts`, `stats`, `categories`, `tags` for dashboard data.
  * Filters: `searchInput` (immediate), `searchQuery` (debounced 300ms), `filterCategory`, `filterStatus`, `sortBy`.
  * `selectedIds: Set<number>` for bulk select, `openMenu` for actions dropdown.
  * `wordCount`, `charCount` from BlogEditor callbacks, `savingStatus` ("idle"|"saving"|"saved"), `lastSavedAt`, `statusMsg`, `scheduleInput`.
  * `formRef` + `lastSavedRef` refs for autosave comparison (JSON.stringify equality) without re-creating closures.

  **Effects**:
  * Initial mount: loadDashboard() + loadCategories() + loadTags().
  * loadPosts() on every [filterStatus, searchQuery, filterCategory, sortBy] change.
  * Debounced search: 300ms timer maps searchInput → searchQuery.
  * beforeunload listener: warns user if `dirty` is true.
  * Autosave interval: every 30s while in editor view with editId, if formRef.current ≠ lastSavedRef.current, PUT /api/blog/{id} with current form, then sync refs + (carefully) only setForm(synced) if user hasn't typed more during request (via functional setState equality check), refresh dashboard stats.

  **Persist function** (handles all save modes):
  * `persistPost(nextForm, mode)` — POST if no editId (creates new post, captures returned id), PUT if existing (sends x-editor:admin header for revision tracking).
  * After save, syncs slug/publishedAt/scheduledAt/status with server response (slug uniqueness may differ from local).
  * Sets savingStatus="saved" + lastSavedAt=HH:MM + contextual status message ("Article published." / "Draft saved." / "Article scheduled." / "Article unpublished.").
  * Refreshes dashboard stats.
  * Variants: saveDraft (status=draft), publishNow (status=published + publishedAt=now, with title-required guard), unpublish (status=draft), schedulePost (validates scheduleInput non-empty, status=scheduled + scheduledAt=ISO), deleteCurrent (window.confirm + DELETE + backToDashboard).

  **Form helpers**:
  * `updateForm(patch)` — merges patch into form via functional setState, updates formRef.current, recalculates dirty flag.
  * `handleTitleChange(title)` — sets title; if !slugEdited, also auto-generates slug from title via slugify().
  * `handleSlugChange(slug)` — sets slugEdited=true so future title edits don't override.

  **Helpers**:
  * `slugify(text)` — lowercase, strip non-alphanumeric, hyphenate.
  * `formatDate(iso)` — toLocaleDateString() with "—" fallback.
  * `formatTime(date)` — toLocaleTimeString with HH:MM format.
  * `isoToLocalInput(iso)` — converts ISO UTC string to YYYY-MM-DDTHH:MM local-time format for `<input type="datetime-local">`.
  * `statusBadge(status)` — returns {bg, color, label} for the 5 statuses (published=green, draft=amber, scheduled=blue, archived=gray, trash=red).

  **Quick add category** — `quickAddCategory()` uses window.prompt for name, POSTs to /api/blog/categories, refreshes categories + dashboard.

  **Back to dashboard** — `backToDashboard()` checks dirty flag + window.confirm; if confirmed (or no changes), resets form/refs/slugEdited/dirty/scheduleInput, calls loadDashboard + loadPosts.

- Removed 4 unused `// eslint-disable-next-line @next/next/no-img-element` comments after first lint pass flagged them as unused directives (the project's eslint config already has `@next/next/no-img-element` rule disabled).
- Smoke-tested via curl against running dev server:
  * GET /api/blog?admin=1&orderby=createdAt&order=desc → returned `{ items: [...6 posts...], total: 6 }` with category + parsed tags
  * GET /api/blog/dashboard → `{ totalArticles:6, published:6, draft:0, scheduled:0, archived:0, trash:0, totalViews:1, categories:6, tags:15 }`
  * GET /api/blog/categories → 6 categories with postCount
  * GET /api/blog/tags → 15 tags sorted by name
  * GET / → 200 (home page renders, dev server no longer crashes)
- Ran `npx eslint src/components/elevate/pages/AdminBlog.tsx` → exit 0 (0 errors, 0 warnings).
- Ran `npx tsc --noEmit --skipLibCheck` → no errors in AdminBlog.tsx (pre-existing errors in AdminAuth.tsx:236 missing onNavigate prop, examples/websocket socket.io-client missing, skills/*, and api/blog/route.ts:95 unused @ts-expect-error are all from other tasks/files).
- Ran `bun run lint` → exit 1 due to pre-existing error in src/components/elevate/AdminAuth.tsx:19 (`react-hooks/set-state-in-effect` rule violation — `if (stored === "1") setAuthed(true);` inside useEffect). This error existed before my task, was called out explicitly in the Task 8 work record ("the pre-existing repo-wide lint error in `src/components/elevate/AdminAuth.tsx:19` (setState-in-effect) belongs to a different agent's task and is NOT part of BlogEditor"), and is therefore out of scope for AdminBlog Component Agent. My file (AdminBlog.tsx) has 0 errors and 0 warnings.
- Wrote this work record to `/home/z/my-project/agent-ctx/7-AdminBlog-Component-Agent.md`.

Stage Summary:
- /home/z/my-project/src/components/elevate/pages/AdminBlog.tsx created (~2100 lines) — unblocks the previously-broken build (AdminPage.tsx was failing to resolve './AdminBlog' before this file existed).
- Full WordPress-style blog admin with two views: dashboard (stats + filters + bulk actions + sortable table with actions dropdown) and editor (TipTap BlogEditor + 7 sidebar panels for publish/category/tags/featured image/author/SEO/social).
- All API integration per spec: dashboard stats, list (with filters/sort/pagination query params), single get, create, partial update (with x-editor header for revision tracking), delete (soft→permanent), categories list, tags list.
- Robust editor lifecycle: 30s autosave using formRef+lastSavedRef comparison (no closure-staleness), dirty flag with beforeunload protection, slug auto-generation with manual-edit detection, autosave doesn't clobber mid-flight user input (functional setState equality check), datetime-local input conversion helper for scheduledAt.
- All actions exposed per spec: per-row Edit/Preview/Duplicate/Publish-Unpublish/Move-to-Draft/Schedule/Delete; bulk Publish/Draft/Delete; quick category creation; status badge color-coding; reading-time footer.
- 100% inline-styled with CSS vars (var(--bg-card), var(--bg-surface), var(--border), var(--text), var(--text-muted), var(--text-heading), var(--primary), var(--primary-light), var(--radius-lg)) and Font Awesome icons (`fas fa-*`).
- `useScrollReveal()` imported from `../useScrollReveal`; `BlogEditor` imported from `../admin/BlogEditor` (correct admin subfolder).
- Lint result: 0 errors, 0 warnings for AdminBlog.tsx specifically (verified via `npx eslint src/components/elevate/pages/AdminBlog.tsx` → exit 0).
- `bun run lint` exits 1 only due to a pre-existing error in src/components/elevate/AdminAuth.tsx:19 (a different agent's task — Task 8 work record explicitly disclaimed this file). My code introduces no new lint errors.
- TypeScript: 0 errors in AdminBlog.tsx (verified via `npx tsc --noEmit --skipLibCheck | grep AdminBlog` → empty).
- Dev server now compiles cleanly ("✓ Compiled in 2.1s" in dev.log) and home page returns HTTP 200.
- Ready to be wired into AdminPage via the already-existing `import { AdminBlog } from "./AdminBlog"` line and rendered when activeTab === "blog".
