import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";

// GET /api/testimonials - list all testimonials sorted by sortOrder ASC
export async function GET() {
  try {
    const items = await db.testimonial.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST /api/testimonials - create a new testimonial
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      role,
      avatar,
      rating,
      quote,
      company,
      companyUrl,
      sortOrder,
      featured,
      published,
    } = body;

    if (!name || !quote) {
      return NextResponse.json(
        { error: "Missing required fields: name, quote" },
        { status: 400 }
      );
    }

    const created = await db.testimonial.create({
      data: {
        name: String(name),
        role: role !== undefined ? String(role) : "",
        avatar: avatar !== undefined ? String(avatar) : "",
        rating:
          rating !== undefined && rating !== null
            ? Math.max(1, Math.min(5, parseInt(rating, 10) || 5))
            : 5,
        quote: sanitizeHtml(String(quote), { allowBasicOnly: true }),
        company: company !== undefined ? String(company) : "",
        companyUrl: companyUrl !== undefined ? String(companyUrl) : "",
        sortOrder:
          sortOrder !== undefined && sortOrder !== null
            ? parseInt(sortOrder, 10)
            : 0,
        featured: featured === true || featured === "true",
        published: published === undefined ? true : Boolean(published),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
