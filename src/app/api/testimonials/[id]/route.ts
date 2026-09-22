import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";

// PUT /api/testimonials/[id] - partial update of any fields
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name);
    if (role !== undefined) data.role = String(role);
    if (avatar !== undefined) data.avatar = String(avatar);
    if (rating !== undefined && rating !== null) {
      data.rating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    }
    if (quote !== undefined) {
      data.quote = sanitizeHtml(String(quote), { allowBasicOnly: true });
    }
    if (company !== undefined) data.company = String(company);
    if (companyUrl !== undefined) data.companyUrl = String(companyUrl);
    if (sortOrder !== undefined && sortOrder !== null) {
      data.sortOrder = parseInt(sortOrder, 10);
    }
    if (featured !== undefined) data.featured = featured === true || featured === "true";
    if (published !== undefined) data.published = Boolean(published);

    const updated = await db.testimonial.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials/[id] - remove testimonial by id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.testimonial.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
