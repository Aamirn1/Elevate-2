import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function safeParseTags(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// PUT /api/projects/[id] - update a project
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, tags, image, url, sortOrder, category } = body;

    const project = await db.project.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && {
          tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        }),
        ...(image !== undefined && { image }),
        ...(url !== undefined && { url }),
        ...(sortOrder !== undefined && {
          sortOrder: sortOrder ? parseInt(sortOrder, 10) : null,
        }),
        ...(category !== undefined && { category: category || null }),
      },
    });

    return NextResponse.json({
      ...project,
      tags: safeParseTags(project.tags),
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - delete a project
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.project.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
