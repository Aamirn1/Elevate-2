# Task 9+10 — Public Blog Pages Agent

## Task
Build redesigned BlogPage listing + BlogArticlePage full article view (public-facing, "use client" components using existing CSS design system).

## Work Log
- Read /home/z/my-project/worklog.md to understand prior context (Elevate-Edge migration to Next.js 16 + TS + Prisma, blog API routes built in Task 4 with GET /api/blog?status=published&category=&search=&limit=&offset=, GET /api/blog/[id-or-slug] auto-detects numeric id vs slug and increments views for public slug lookups, GET /api/blog/categories returns array of {id,name,slug,...,postCount}; TipTap editor + AdminBlog already built and linting cleanly).
- Inspected existing BlogPage.tsx (hardcoded 6 posts using service-card class with icon + title + category pill + readTime + excerpt + date + "Read More" WhatsApp link), useScrollReveal hook (auto-observes .reveal elements + re-scans every 1s for dynamically loaded content), ServicesPage hero pattern (badge + gradient-text h1 + hero-sub), globals.css for `.service-card` (padding 36px/28px, gradient bg, hover translateY -8px, primary glow) and confirmed `.services-section`/`.services-grid` (auto-fit minmax 270px 1fr, gap 24px).
- Confirmed API response shapes by curl: GET /api/blog returns `{items: BlogPost[], total: number}` with each post having `{id, title, slug, excerpt, content, coverImage, coverAlt, author, authorBio, authorAvatar, categoryId, category: {id,name,slug} | null, tags: string[], status, views, readingTime, publishedAt, createdAt}`; GET /api/blog/categories returns array of `{id, name, slug, description, image, parentId, sortOrder, createdAt, postCount}`; GET /api/blog/<slug> returns single post (404 if not found) and increments views.
- Created `/home/z/my-project/src/components/elevate/pages/BlogPage.tsx` (~789 lines) as a "use client" component:
  * Preserved hero section exactly (badge "Our Blog" with fa-blog icon, h1 with gradient-text "Insights &" + text-muted "Industry Tips", hero-sub paragraph)
  * Category filter bar (All + each category from /api/blog/categories) — pill buttons with active gradient-primary background and white text, inactive pills use bg-card + border
  * Search input with fa-search icon prefix, debounced 300ms via setTimeout/setSearchQuery, resets offset to 0 on search change
  * Blog grid uses services-grid CSS class — each card is `<article className="service-card reveal">` with:
    - 16:9 cover image (object-cover) with fallback fa-image icon if no coverImage
    - Category overlay pill (top-left, black bg + white text + uppercase)
    - Title (h3, clickable + hover-color to primary)
    - Excerpt (3-line clamp via -webkit-box)
    - Author row (avatar or initial circle + author name + reading time + date)
    - "Read More" btn btn-primary (navigates to /blog/<slug>)
  * Card click handler triggers onNavigate(`/blog/${slug}`) — wired through article onClick, title onClick (stopPropagation), button onClick (stopPropagation)
  * Pagination (only if total > 12): Prev/Next buttons with disabled state at boundaries, "Page X of Y" label, uses offset in PAGE_SIZE (12) increments
  * Loading state: 6 skeleton cards with .blog-skeleton-shimmer class (CSS animation in globals.css)
  * Empty state: "No articles found" with fa-newspaper icon + clear-filters button (if search or category was applied)
  * Error state: error message + Retry button that re-calls loadPosts
  * CTA section preserved exactly ("Ready to Elevate Your Business?" + Order Now button to /contact)
  * Dates formatted via toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) → "Jan 15, 2026"
  * Reading time labeled as "<N> min read" (min 1)
- Created `/home/z/my-project/src/components/elevate/pages/BlogArticlePage.tsx` (~810 lines) as a "use client" component:
  * Props: `{ slug: string; onNavigate: (path: string) => void }`
  * Back button at top (fa-arrow-left + "Back to Blog") → onNavigate("/blog")
  * Article hero: category badge (uppercase, primary-tinted bg), large h1 title (clamp 1.8-2.6rem responsive), author row with avatar (or initial circle) + author name + date + reading time + view count, all separated with ·
  * Cover image full-width 16:9 with rounded border (only if coverImage present)
  * Article content rendered via `<div className="blog-article-content" dangerouslySetInnerHTML={{__html: post.content}} />` — content already sanitized by API per Task 4 work record
  * Tags pills below content (#tag format) if tags array non-empty
  * Share buttons: WhatsApp (wa.me), Facebook (sharer.php), X/Twitter (intent/tweet), LinkedIn (sharing/share-offsite), Copy Link (navigator.clipboard.writeText with "Copied!" feedback for 2s) — each opens in new tab with noopener noreferrer, hover color matches brand color
  * Author bio card (only if authorBio exists) — 70px avatar (or initial circle with gradient-primary bg + primary border), "Written by" label, author name h3, bio paragraph
  * Related articles: fetches 3 from same category (excluding current post), falls back to latest if fewer than 3 available, displayed as RelatedCard components with cover image + title (2-line clamp) + reading time + date
  * CTA section: "Want Results Like These?" + "Order Now" button to /contact
  * Loading state: spinner (CSS keyframe blog-spin) + skeleton blocks for title/hero/image/paragraphs
  * 404 state: fa-search icon + "Article not found" h1 + explanation + Back to Blog button
  * useEffect on [slug] fetches post by slug; resets state on slug change; scrolls to top on mount
- Added CSS to /home/z/my-project/src/app/globals.css for:
  * `.blog-skeleton-shimmer` + `@keyframes blog-skeleton-shimmer` (background-position scroll animation for loading skeletons)
  * `.blog-article-content` typography rules: h1-h6 (sized 2rem→0.95rem, bold, 1.3 line-height, 1.6em top margin), p (1.1em bottom margin, 1.85 line-height), a (primary color, underline, hover to primary-light), ul/ol (disc/decimal, 1.6em padding-left), blockquote (primary left border, primary-tinted bg, italic, muted text), img (max-width 100%, 10px border-radius, 1.4em margins), figure (centered, 1.6em margins), figcaption (italic, 0.85rem, muted), pre (#0d0d18 dark bg, monospace 0.88rem, 10px radius, overflow-x auto), code (primary-tinted bg, primary-light color, monospace, 5px radius), pre code (transparent bg, inherits), table (100% width, border-collapse, 0.92rem), th/td (1px border, 10px/14px padding, th has primary-tinted bg + bold), hr (2px border-top, 2em margins), mark (yellow-tinted bg), iframe (16:9 aspect ratio, 10px radius), [data-youtube-video] + .youtube-wrapper (responsive 16:9 iframe container), ul[data-type="taskList"] (flex layout for TipTap task lists)
- Wired up dynamic blog article route in /home/z/my-project/src/app/page.tsx:
  * Imported BlogArticlePage from "@/components/elevate/pages/BlogArticlePage"
  * Added pre-switch check in renderPage(): if currentPath.startsWith("/blog/") and slug non-empty, render <BlogArticlePage slug={slug} onNavigate={navigate} />
  * Updated useEffect to set document.title to "Article | ElevateEdge Digital" for /blog/<slug> paths (routeTitles map only has exact strings)
- Removed 6 unused `// eslint-disable-next-line @next/next/no-img-element` comments (the rule is disabled in eslint.config.mjs, so the directives produce "Unused eslint-disable directive" warnings) via `sed -i` across both files.
- Ran `bun run lint` → exit 0 (0 errors, 0 warnings) — clean.
- Smoke-tested API endpoints via curl:
  * GET /api/blog?status=published&limit=12&offset=0 → 200, returns {items: [...6 posts], total: 6}
  * GET /api/blog/categories → 200, returns 6 categories with postCount
  * GET /api/blog/mobile-first-design-why-it-matters-more-than-ever → 200, returns single post + increments views
  * GET /api/blog?status=published&category=web-design&search=design&limit=12&offset=0 → 200, returns filtered items correctly
  * GET / → 200 (home page renders without errors)
- Verified dev.log shows no compile errors — Next.js compiled cleanly and all API requests return 200.

## Stage Summary
- 2 new files created:
  1. /home/z/my-project/src/components/elevate/pages/BlogPage.tsx (~789 lines) — redesigned blog listing with hero section, category filter pills, debounced search input, services-grid of cards (cover image + category overlay + title + excerpt + author row + Read More button), Prev/Next pagination, skeleton loading state, empty state, error state, preserved CTA section.
  2. /home/z/my-project/src/components/elevate/pages/BlogArticlePage.tsx (~810 lines) — full article view with back button, article hero (category badge + title + author row), cover image, article content via dangerouslySetInnerHTML in .blog-article-content class, tags, share buttons (WhatsApp/Facebook/X/LinkedIn/Copy Link with feedback), author bio card, related articles (3 from same category with fallback to latest), CTA section, loading skeleton, 404 state.
- Modified files:
  1. /home/z/my-project/src/app/globals.css — added .blog-skeleton-shimmer keyframe animation + comprehensive .blog-article-content typography rules covering all TipTap editor output (h1-h6, p, ul, ol, li, blockquote, pre, code, a, img, figure, figcaption, table, th, td, hr, mark, iframe, [data-youtube-video], .youtube-wrapper, ul[data-type=taskList])
  2. /home/z/my-project/src/app/page.tsx — imported BlogArticlePage, added dynamic /blog/<slug> route check before switch statement, added "Article | ElevateEdge Digital" document title fallback for blog article routes
- API integration per spec:
  - BlogPage uses GET /api/blog?status=published&limit=12&offset=N&category=<slug>&search=<text> for listing + pagination
  - BlogPage uses GET /api/blog/categories for category pills
  - BlogArticlePage uses GET /api/blog/<slug> for single article (auto-increments views via API)
  - BlogArticlePage uses GET /api/blog?status=published&category=<cat-slug>&limit=4 for related posts (excludes current, falls back to latest if <3 from same category)
- Card click behavior: clicking cover image, title, or "Read More" button all call onNavigate(`/blog/${post.slug}`)
- All CSS uses existing classes from globals.css (hero, hero-content, hero-badge, gradient-text, hero-sub, services-section, services-grid, service-card, cta-section, btn btn-primary, btn-pulse, reveal) + new .blog-article-content + .blog-skeleton-shimmer classes
- Lint passes with 0 errors, 0 warnings — all 6 unused eslint-disable directive warnings were resolved by removing the no-longer-needed directives.
