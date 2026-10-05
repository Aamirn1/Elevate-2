import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  console.log("🌱 Seeding blog categories, tags, posts, and testimonials...");

  // ── Blog Categories ──────────────────────────────
  const categories = [
    { name: "Web Design", description: "Latest trends, tips, and insights on web design and UI/UX." },
    { name: "Digital Marketing", description: "Strategies to grow your business online." },
    { name: "SEO", description: "Search engine optimization tips and best practices." },
    { name: "Social Media", description: "Social media management and marketing guides." },
    { name: "Business", description: "Business growth and entrepreneurship insights." },
    { name: "Web Development", description: "Technical articles on web development." },
  ];

  for (const cat of categories) {
    await db.blogCategory.upsert({
      where: { slug: slugify(cat.name) },
      update: {},
      create: {
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        sortOrder: categories.indexOf(cat) + 1,
      },
    });
  }
  console.log(`  ✓ ${categories.length} blog categories`);

  // ── Blog Tags ────────────────────────────────────
  const tagNames = [
    "Web Design", "UI/UX", "Typography", "Responsive", "Digital Marketing",
    "Google Ads", "Growth", "SEO", "Google Ranking", "Social Media",
    "Content Strategy", "Business", "Website", "Mobile-First", "WordPress",
  ];
  for (const name of tagNames) {
    await db.blogTag.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }
  console.log(`  ✓ ${tagNames.length} blog tags`);

  // ── Blog Posts (6 sample articles) ──────────────
  const posts = [
    {
      title: "10 Web Design Trends That Will Dominate in 2026",
      excerpt:
        "From immersive 3D elements to bold typography, discover the design trends that will shape the web in 2026 and how to implement them in your projects.",
      content: `<h2>Introduction</h2><p>The web design landscape evolves rapidly. As we approach 2026, several powerful trends are emerging that will define how websites look and feel. In this article, we explore <strong>ten design trends</strong> that every business and designer should know.</p><h2>1. Immersive 3D Elements</h2><p>Three-dimensional graphics and interactive 3D elements are becoming more accessible thanks to WebGL and CSS 3D transforms. Expect to see more websites with depth, parallax layers, and interactive 3D objects.</p><h2>2. Bold Typography</h2><p>Oversized, expressive typography is replacing minimal text. Variable fonts allow dynamic weight changes, creating visual hierarchy without images.</p><h2>3. Dark Mode by Default</h2><p>More websites are offering dark mode as the default experience, reducing eye strain and saving battery on OLED screens.</p><h2>4. Glassmorphism</h2><p>Frosted-glass effects with backdrop blur create depth and sophistication, especially over colorful gradient backgrounds.</p><h2>5. Micro-Interactions</h2><p>Subtle animations — button hovers, loading states, scroll reveals — make interfaces feel alive and responsive.</p><h2>Conclusion</h2><p>These trends represent the cutting edge of web design in 2026. Implementing even a few of them can dramatically improve your website's visual appeal and user engagement.</p>`,
      coverImage: "/portfolio/food-express.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Web Design",
      tags: ["Web Design", "UI/UX", "Typography"],
      readingTime: 5,
    },
    {
      title: "How Digital Marketing Can 2x Your Business Growth",
      excerpt:
        "Learn proven digital marketing strategies that have helped businesses double their growth. From Google Ads to social media, we cover it all.",
      content: `<h2>Why Digital Marketing Matters</h2><p>In today's digital-first world, a strong online presence is no longer optional — it's essential for survival. Businesses that invest in digital marketing see <strong>2-3x faster growth</strong> than those that don't.</p><h2>1. Search Engine Optimization (SEO)</h2><p>SEO helps your website rank higher on Google, bringing free organic traffic. Focus on quality content, fast loading speeds, and mobile optimization.</p><h2>2. Google Ads</h2><p>Pay-per-click advertising delivers instant visibility. Target specific keywords and demographics to reach customers actively searching for your services.</p><h2>3. Social Media Marketing</h2><p>Platforms like Facebook, Instagram, and LinkedIn offer powerful targeting options. Consistent posting and engagement build brand loyalty.</p><h2>4. Email Marketing</h2><p>Email remains one of the highest-ROI marketing channels. Build a subscriber list and send valuable content regularly.</p><h2>Conclusion</h2><p>By combining these strategies, businesses can achieve exponential growth. The key is consistency, measurement, and continuous optimization.</p>`,
      coverImage: "/portfolio/skyrocket-growth-hub.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Digital Marketing",
      tags: ["Digital Marketing", "Google Ads", "Growth"],
      readingTime: 7,
    },
    {
      title: "Why Every Business Needs a Professional Website in 2026",
      excerpt:
        "Your website is your digital storefront. Discover why having a professional website is no longer optional but essential for business success.",
      content: `<h2>The Digital Storefront</h2><p>Your website is often the first impression potential customers have of your business. In 2026, <strong>81% of consumers</strong> research a company online before making a purchase decision.</p><h2>Credibility and Trust</h2><p>A professional website builds credibility. Without one, potential customers may question whether your business is legitimate or established.</p><h2>24/7 Availability</h2><p>Unlike a physical store, your website never closes. It works around the clock, capturing leads and answering questions even while you sleep.</p><h2>Cost-Effective Marketing</h2><p>Compared to traditional advertising, a website is a one-time investment that continues to generate leads and sales for years.</p><h2>Conclusion</h2><p>In an increasingly digital world, a professional website is not a luxury — it's a necessity. Businesses without one are losing customers to competitors who have embraced the online space.</p>`,
      coverImage: "/portfolio/opus-solutions.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Business",
      tags: ["Business", "Website"],
      readingTime: 4,
    },
    {
      title: "The Ultimate Guide to Social Media Management",
      excerpt:
        "Master social media management with our comprehensive guide. Learn content strategies, scheduling tips, and engagement techniques that work.",
      content: `<h2>Introduction</h2><p>Social media management is more than just posting content. It's about building a community, engaging with your audience, and driving measurable business results.</p><h2>1. Content Strategy</h2><p>Define your brand voice and content pillars. Plan a mix of educational, promotional, and entertaining content.</p><h2>2. Consistent Scheduling</h2><p>Post consistently using a content calendar. Tools like Buffer and Hootsuite help automate posting at optimal times.</p><h2>3. Community Engagement</h2><p>Respond to comments and messages promptly. Engage with followers' content to build genuine relationships.</p><h2>4. Analytics and Optimization</h2><p>Track metrics like reach, engagement rate, and click-through rate. Adjust your strategy based on what works.</p><h2>Conclusion</h2><p>Effective social media management requires strategy, consistency, and adaptability. Start with these fundamentals and refine your approach over time.</p>`,
      coverImage: "/portfolio/fwz-pk.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Social Media",
      tags: ["Social Media", "Content Strategy"],
      readingTime: 8,
    },
    {
      title: "SEO Optimization: Rank Higher on Google in 2026",
      excerpt:
        "Stay ahead of the competition with the latest SEO strategies. Learn how to optimize your website for better search rankings and more traffic.",
      content: `<h2>The State of SEO in 2026</h2><p>Search engine optimization continues to evolve. Google's algorithms now prioritize user experience, content quality, and mobile-friendliness above all else.</p><h2>1. Core Web Vitals</h2><p>Google measures loading speed, interactivity, and visual stability. Optimize these metrics for better rankings.</p><h2>2. Quality Content</h2><p>Long-form, in-depth content that genuinely helps users ranks higher. Focus on E-E-A-T: Experience, Expertise, Authoritativeness, Trustworthiness.</p><h2>3. Mobile-First Indexing</h2><p>Google uses the mobile version of your site for indexing. Ensure your mobile experience is flawless.</p><h2>4. Technical SEO</h2><p>Optimize meta tags, structured data, sitemaps, and internal linking. Fix broken links and ensure crawlability.</p><h2>Conclusion</h2><p>SEO is a long-term investment. By focusing on user experience and quality content, you can achieve sustainable organic growth.</p>`,
      coverImage: "/portfolio/tradelink.jpg",
      author: "ElevateEdge Digital",
      categoryName: "SEO",
      tags: ["SEO", "Google Ranking"],
      readingTime: 6,
    },
    {
      title: "Mobile-First Design: Why It Matters More Than Ever",
      excerpt:
        "With over 60% of web traffic coming from mobile devices, mobile-first design is critical. Here's how to ensure your website delivers on every screen.",
      content: `<h2>The Mobile Revolution</h2><p>Over <strong>60% of web traffic</strong> now comes from mobile devices. If your website isn't optimized for mobile, you're losing more than half your potential audience.</p><h2>What is Mobile-First Design?</h2><p>Mobile-first means designing for the smallest screen first, then progressively enhancing for larger screens. This approach forces you to prioritize essential content.</p><h2>1. Responsive Layouts</h2><p>Use CSS media queries and flexible grids to adapt your layout to any screen size.</p><h2>2. Touch-Friendly Navigation</h2><p>Ensure buttons are at least 44px and spaced for touch. Replace hover-only interactions with tap-friendly alternatives.</p><h2>3. Fast Loading</h2><p>Mobile users are impatient. Optimize images, minimize JavaScript, and use lazy loading to keep load times under 3 seconds.</p><h2>Conclusion</h2><p>Mobile-first design isn't just a trend — it's a necessity. By prioritizing the mobile experience, you serve the majority of your visitors and improve your search rankings.</p>`,
      coverImage: "/portfolio/my-dollar-store.jpg",
      author: "ElevateEdge Digital",
      categoryName: "Web Design",
      tags: ["Web Design", "Responsive", "Mobile-First"],
      readingTime: 5,
    },
  ];

  for (const post of posts) {
    const cat = await db.blogCategory.findUnique({
      where: { slug: slugify(post.categoryName) },
    });
    const existing = await db.blogPost.findUnique({
      where: { slug: slugify(post.title) },
    });
    if (existing) {
      // update views/status if needed, skip creation
      continue;
    }
    await db.blogPost.create({
      data: {
        title: post.title,
        slug: slugify(post.title),
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        coverAlt: post.title,
        author: post.author,
        categoryId: cat?.id ?? null,
        tags: JSON.stringify(post.tags),
        status: "published",
        readingTime: post.readingTime,
        publishedAt: new Date(),
        sortOrder: posts.indexOf(post) + 1,
      },
    });
  }
  console.log(`  ✓ ${posts.length} blog posts`);

  // ── Testimonials (6 sample) ───────────────────────
  const testimonials = [
    {
      name: "Aamir Hassan",
      role: "Founder",
      company: "Signature Stitch",
      companyUrl: "https://www.signaturestitchs.com",
      rating: 5,
      quote:
        "ElevateEdge Digital transformed our online presence. The e-commerce store they built increased our sales by 150% within three months. Truly exceptional work!",
      avatar: "",
      featured: true,
    },
    {
      name: "Sara Khan",
      role: "Marketing Director",
      company: "My Dollar Store",
      companyUrl: "https://mydollarstore.vercel.app/",
      rating: 5,
      quote:
        "The team delivered a stunning electronics store that's fast, beautiful, and easy to manage. Our conversion rate doubled within weeks of launch.",
      avatar: "",
      featured: false,
    },
    {
      name: "Bilal Ahmed",
      role: "Owner",
      company: "Food Express",
      companyUrl: "https://foodexpresslalkurti.vercel.app/",
      rating: 5,
      quote:
        "Our restaurant website is now the best in the city. Online orders have tripled since the new site went live. Outstanding service and support!",
      avatar: "",
      featured: true,
    },
    {
      name: "Chohan Raza",
      role: "Barbershop Owner",
      company: "Chohan's Style",
      companyUrl: "https://chohan-s-style-dsaa.vercel.app/",
      rating: 5,
      quote:
        "The booking system they integrated has revolutionized how we manage appointments. Walk-ins and online bookings work seamlessly together.",
      avatar: "",
      featured: false,
    },
    {
      name: "Fatima Noor",
      role: "CEO",
      company: "Opus Solutions",
      companyUrl: "https://opussolutions.vercel.app/",
      rating: 5,
      quote:
        "Our real estate lead generation website captures 3x more qualified leads than before. The ROI has been incredible. Highly recommend ElevateEdge!",
      avatar: "",
      featured: false,
    },
    {
      name: "Usman Tariq",
      role: "Director",
      company: "Skyrocket Growth Hub",
      companyUrl: "https://skyrocket-growth-hub.vercel.app/",
      rating: 5,
      quote:
        "The social media management service helped us grow from 2K to 50K followers in six months. Real engagement, real results. Thank you!",
      avatar: "",
      featured: true,
    },
  ];

  for (const t of testimonials) {
    const existing = await db.testimonial.findFirst({
      where: { name: t.name, company: t.company },
    });
    if (existing) continue;
    await db.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        company: t.company,
        companyUrl: t.companyUrl,
        rating: t.rating,
        quote: t.quote,
        avatar: t.avatar,
        featured: t.featured,
        published: true,
        sortOrder: testimonials.indexOf(t) + 1,
      },
    });
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  console.log("\n✅ Seeding complete!");
  await db.$disconnect();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  db.$disconnect();
  process.exit(1);
});
