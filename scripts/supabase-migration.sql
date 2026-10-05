-- Supabase migration: Blog + Testimonials tables
-- Run this in the Supabase Dashboard > SQL Editor

-- ============================================
-- TESTIMONIALS
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  rating INT NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  company_url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- BLOG CATEGORIES (hierarchical)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  parent_id BIGINT REFERENCES blog_categories(id) ON DELETE SET NULL,
  sort_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent ON blog_categories(parent_id);

-- ============================================
-- BLOG POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'ElevateEdge Digital',
  author_bio TEXT NOT NULL DEFAULT '',
  author_avatar TEXT NOT NULL DEFAULT '',
  category_id BIGINT REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  sort_order INT,
  views INT NOT NULL DEFAULT 0,
  reading_time INT NOT NULL DEFAULT 0,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  focus_keyword TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  twitter_title TEXT NOT NULL DEFAULT '',
  twitter_description TEXT NOT NULL DEFAULT '',
  twitter_image TEXT NOT NULL DEFAULT '',
  robots_meta TEXT NOT NULL DEFAULT 'index,follow',
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);

-- ============================================
-- BLOG REVISIONS
-- ============================================
CREATE TABLE IF NOT EXISTS blog_revisions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  editor_name TEXT NOT NULL DEFAULT 'admin',
  revision_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_revisions_post ON blog_revisions(post_id);

-- ============================================
-- BLOG MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS blog_media (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  width INT,
  height INT,
  file_size INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- BLOG TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS blog_tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) — enable and add policies
-- Public can read published content; all writes go through the anon key
-- ============================================

-- Testimonials: public read published, anon can write
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (published = TRUE);
CREATE POLICY "Anon all access testimonials" ON testimonials USING (TRUE) WITH CHECK (TRUE);

-- Blog categories: public read, anon write
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "Anon all access categories" ON blog_categories USING (TRUE) WITH CHECK (TRUE);

-- Blog posts: public read published, anon all access
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON blog_posts FOR SELECT USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "Anon all access posts" ON blog_posts USING (TRUE) WITH CHECK (TRUE);

-- Blog revisions: anon all access
ALTER TABLE blog_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon all access revisions" ON blog_revisions USING (TRUE) WITH CHECK (TRUE);

-- Blog media: anon all access
ALTER TABLE blog_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon all access media" ON blog_media USING (TRUE) WITH CHECK (TRUE);

-- Blog tags: anon all access
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon all access tags" ON blog_tags USING (TRUE) WITH CHECK (TRUE);

-- ============================================
-- AUTO-UPDATE updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
