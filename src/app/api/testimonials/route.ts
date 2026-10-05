import { NextRequest, NextResponse } from "next/server";
import { fetchTestimonials, createTestimonial } from "@/lib/data";

export async function GET() {
  try {
    const data = await fetchTestimonials();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load testimonials:", error);
    return NextResponse.json(
      { error: "Failed to load testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.quote) {
      return NextResponse.json(
        { error: "Name and quote are required" },
        { status: 400 }
      );
    }
    const data = await createTestimonial({
      name: body.name,
      role: body.role,
      avatar: body.avatar,
      rating: body.rating,
      quote: body.quote,
      company: body.company,
      companyUrl: body.companyUrl,
      sortOrder: body.sortOrder,
      featured: body.featured,
      published: body.published,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
