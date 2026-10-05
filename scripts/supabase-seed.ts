/**
 * Supabase table creation + seed script.
 *
 * Usage:
 *   1. Go to https://supabase.com/dashboard > your project > SQL Editor
 *   2. Paste the contents of scripts/supabase-migration.sql
 *   3. Click "Run"
 *   4. Then run: bun run scripts/supabase-seed.ts
 *
 * This script seeds the Supabase tables with initial blog posts, categories,
 * tags, and testimonials (same data that was in the local SQLite database).
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wppibetbaddytimymzsz.supabase.co";
const supabaseKey = "sb_publishable_cboYn8tXg0roKx7nRE_eZg_2xBqwfYY";

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function checkTables() {
  console.log("📋 Checking if tables exist...");
  const { error } = await supabase
    .from("testimonials")
    .select("id")
    .limit(1);
  if (error && error.code === "PGRST205") {
    console.error("❌ Tables don't exist yet!");
    console.error(
      "   Please run the SQL migration first:"
    );
    console.error(
      "   1. Go to https://supabase.com/dashboard > your project > SQL Editor"
    );
    console.error("   2. Paste the contents of scripts/supabase-migration.sql");
    console.error("   3. Click Run");
    console.error("   4. Then re-run this script: bun run scripts/supabase-seed.ts");
    process.exit(1);
  }
  if (error) {
    console.error("❌ Error checking tables:", error.message);
    process.exit(1);
  }
  console.log("   ✅ Tables exist!");
}

async function seedCategories() {
  console.log("\n🌱 Seeding blog categories...");
  const categories = [
    { name: "Web Design", description: "Latest trends, tips, and insights on web design and UI/UX.", sort_order: 1 },
    { name: "Digital Marketing", description: "Strategies to grow your business online.", sort_order: 2 },
    { name: "SEO", description: "Search engine optimization tips and best practices.", sort_order: 3 },
    { name: "Social Media", description: "Social media management and marketing guides.", sort_order: 4 },
    { name: "Business", description: "Business growth and entrepreneurship insights.", sort_order: 5 },
    { name: "Web Development", description: "Technical articles on web development.", sort_order: 6 },
  ];
  for (const cat of categories) {
    const { error } = await supabase
      .from("blog_categories")
      .upsert({ ...cat, slug: slugify(cat.name) }, { onConflict: "slug" });
    if (error) console.error(`  ❌ ${cat.name}:`, error.message);
    else console.log(`  ✅ ${cat.name}`);
  }
  return categories;
}

async function seedTags() {
  console.log("\n🌱 Seeding blog tags...");
  const tagNames = [
    "Web Design", "UI/UX", "Typography", "Responsive", "Digital Marketing",
    "Google Ads", "Growth", "SEO", "Google Ranking", "Social Media",
    "Content Strategy", "Business", "Website", "Mobile-First", "WordPress",
  ];
  for (const name of tagNames) {
    const { error } = await supabase
      .from("blog_tags")
      .upsert({ name, slug: slugify(name) }, { onConflict: "slug" });
    if (error) console.error(`  ❌ ${name}:`, error.message);
    else console.log(`  ✅ ${name}`);
  }
}

async function getCategoryId(name: string): Promise<number | null> {
  const { data } = await supabase
    .from("blog_categories")
    .select("id")
    .eq("slug", slugify(name))
    .single();
  return data?.id ?? null;
}

async function seedBlogPosts() {
  console.log("\n🌱 Seeding blog posts...");
  const posts = [
    {
      title: "10 Web Design Trends That Will Dominate in 2026",
      excerpt: "From immersive 3D elements to bold typography, discover the design trends that will shape the web in 2026.",
      content: "<h2>Introduction</h2><p>The web design landscape evolves rapidly. As we approach 2026, several powerful trends are emerging that will define how websites look and feel.</p><h2>1. Immersive 3D Elements</h2><p>Three-dimensional graphics and interactive 3D elements are becoming more accessible thanks to WebGL and CSS 3D transforms.</p><h2>2. Bold Typography</h2><p>Oversized, expressive typography is replacing minimal text.</p><h2>3. Dark Mode by Default</h2><p>More websites are offering dark mode as the default experience.</p><h2>4. Glassmorphism</h2><p>Frosted-glass effects with backdrop blur create depth and sophistication.</p><h2>5. Micro-Interactions</h2><p>Subtle animations make interfaces feel alive and responsive.</p><h2>Conclusion</h2><p>These trends represent the cutting edge of web design in 2026.</p>",
      cover_image: "/portfolio/food-express.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Web Design",
      tags: ["Web Design", "UI/UX", "Typography"],
      reading_time: 5,
    },
    {
      title: "How Digital Marketing Can 2x Your Business Growth",
      excerpt: "Learn proven digital marketing strategies that have helped businesses double their growth.",
      content: "<h2>Why Digital Marketing Matters</h2><p>Businesses that invest in digital marketing see 2-3x faster growth.</p><h2>1. SEO</h2><p>SEO helps your website rank higher on Google.</p><h2>2. Google Ads</h2><p>Pay-per-click advertising delivers instant visibility.</p><h2>3. Social Media Marketing</h2><p>Consistent posting builds brand loyalty.</p><h2>4. Email Marketing</h2><p>Email remains one of the highest-ROI marketing channels.</p><h2>Conclusion</h2><p>Consistency, measurement, and continuous optimization are key.</p>",
      cover_image: "/portfolio/skyrocket-growth-hub.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Digital Marketing",
      tags: ["Digital Marketing", "Google Ads", "Growth"],
      reading_time: 7,
    },
    {
      title: "Why Every Business Needs a Professional Website in 2026",
      excerpt: "Your website is your digital storefront. Discover why having a professional website is essential.",
      content: "<h2>The Digital Storefront</h2><p>81% of consumers research a company online before purchasing.</p><h2>Credibility and Trust</h2><p>A professional website builds credibility.</p><h2>24/7 Availability</h2><p>Your website never closes.</p><h2>Cost-Effective Marketing</h2><p>A website is a one-time investment that generates leads for years.</p><h2>Conclusion</h2><p>A professional website is not a luxury — it's a necessity.</p>",
      cover_image: "/portfolio/opus-solutions.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Business",
      tags: ["Business", "Website"],
      reading_time: 4,
    },
    {
      title: "The Ultimate Guide to Social Media Management",
      excerpt: "Master social media management with our comprehensive guide.",
      content: "<h2>Introduction</h2><p>Social media management is more than just posting content.</p><h2>1. Content Strategy</h2><p>Define your brand voice and content pillars.</p><h2>2. Consistent Scheduling</h2><p>Post consistently using a content calendar.</p><h2>3. Community Engagement</h2><p>Respond to comments and build relationships.</p><h2>4. Analytics</h2><p>Track metrics and adjust your strategy.</p><h2>Conclusion</h2><p>Effective social media requires strategy, consistency, and adaptability.</p>",
      cover_image: "/portfolio/fwz-pk.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Social Media",
      tags: ["Social Media", "Content Strategy"],
      reading_time: 8,
    },
    {
      title: "SEO Optimization: Rank Higher on Google in 2026",
      excerpt: "Stay ahead with the latest SEO strategies.",
      content: "<h2>The State of SEO in 2026</h2><p>Google's algorithms prioritize user experience and content quality.</p><h2>1. Core Web Vitals</h2><p>Optimize loading speed, interactivity, and visual stability.</p><h2>2. Quality Content</h2><p>Focus on E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness.</p><h2>3. Mobile-First Indexing</h2><p>Ensure your mobile experience is flawless.</p><h2>4. Technical SEO</h2><p>Optimize meta tags, structured data, sitemaps, and internal linking.</p><h2>Conclusion</h2><p>SEO is a long-term investment in user experience and quality content.</p>",
      cover_image: "/portfolio/tradelink.jpg",
      author: "ElevateEdge Digital",
      categoryName: "SEO",
      tags: ["SEO", "Google Ranking"],
      reading_time: 6,
    },
    {
      title: "Mobile-First Design: Why It Matters More Than Ever",
      excerpt: "With over 60% of web traffic from mobile, mobile-first design is critical.",
      content: "<h2>The Mobile Revolution</h2><p>Over 60% of web traffic comes from mobile devices.</p><h2>What is Mobile-First Design?</h2><p>Designing for the smallest screen first, then enhancing for larger screens.</p><h2>1. Responsive Layouts</h2><p>Use CSS media queries and flexible grids.</p><h2>2. Touch-Friendly Navigation</h2><p>Ensure buttons are at least 44px and spaced for touch.</p><h2>3. Fast Loading</h2><p>Optimize images and minimize JavaScript.</p><h2>Conclusion</h2><p>Mobile-first design is a necessity for modern websites.</p>",
      cover_image: "/portfolio/my-dollar-store.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Web Design",
      tags: ["Web Design", "Responsive", "Mobile-First"],
      reading_time: 5,
    },
  ];

  for (const post of posts) {
    const categoryId = await getCategoryId(post.categoryName);
    const slug = slugify(post.title);
    // Check if already exists
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) {
      console.log(`  ⏭️  ${post.title} (already exists)`);
      continue;
    }
    const { error } = await supabase.from("blog_posts").insert({
      title: post.title,
      slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.cover_image,
      cover_alt: post.title,
      author: post.author,
      category_id: categoryId,
      tags: JSON.stringify(post.tags),
      status: "published",
      reading_time: post.reading_time,
      published_at: new Date().toISOString(),
      sort_order: posts.indexOf(post) + 1,
    });
    if (error) console.error(`  ❌ ${post.title}:`, error.message);
    else console.log(`  ✅ ${post.title}`);
  }
}

async function seedTestimonials() {
  console.log("\n🌱 Seeding testimonials...");
  const testimonials = [
    {
      name: "Aamir Hassan", role: "Founder", company: "Signature Stitch",
      company_url: "https://www.signaturestitchs.com", rating: 5,
      quote: "ElevateEdge Digital transformed our online presence. The e-commerce store they built increased our sales by 150% within three months.",
      featured: true, sort_order: 1,
    },
    {
      name: "Sara Khan", role: "Marketing Director", company: "My Dollar Store",
      company_url: "https://mydollarstore.vercel.app/", rating: 5,
      quote: "The team delivered a stunning electronics store that's fast, beautiful, and easy to manage. Our conversion rate doubled within weeks.",
      sort_order: 2,
    },
    {
      name: "Bilal Ahmed", role: "Owner", company: "Food Express",
      company_url: "https://foodexpresslalkurti.vercel.app/", rating: 5,
      quote: "Our restaurant website is now the best in the city. Online orders have tripled since the new site went live.",
      featured: true, sort_order: 3,
    },
    {
      name: "Chohan Raza", role: "Barbershop Owner", company: "Chohan's Style",
      company_url: "https://chohan-s-style-dsaa.vercel.app/", rating: 5,
      quote: "The booking system they integrated has revolutionized how we manage appointments.",
      sort_order: 4,
    },
    {
      name: "Fatima Noor", role: "CEO", company: "Opus Solutions",
      company_url: "https://opussolutions.vercel.app/", rating: 5,
      quote: "Our real estate lead generation website captures 3x more qualified leads than before.",
      sort_order: 5,
    },
    {
      name: "Usman Tariq", role: "Director", company: "Skyrocket Growth Hub",
      company_url: "https://skyrocket-growth-hub.vercel.app/", rating: 5,
      quote: "The social media management service helped us grow from 2K to 50K followers in six months.",
      featured: true, sort_order: 6,
    },
  ];

  for (const t of testimonials) {
    const { data: existing } = await supabase
      .from("testimonials")
      .select("id")
      .eq("name", t.name)
      .maybeSingle();
    if (existing) {
      console.log(`  ⏭️  ${t.name} (already exists)`);
      continue;
    }
    const { error } = await supabase.from("testimonials").insert({
      ...t,
      published: true,
      avatar: "",
    });
    if (error) console.error(`  ❌ ${t.name}:`, error.message);
    else console.log(`  ✅ ${t.name}`);
  }
}

async function main() {
  console.log("🚀 Supabase seed script");
  console.log(`   URL: ${supabaseUrl}`);
  await checkTables();
  await seedCategories();
  await seedTags();
  await seedBlogPosts();
  await seedTestimonials();
  console.log("\n✅ Seed complete!");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
