import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/projects - list all projects
export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    const parsed = projects.map((p) => ({
      ...p,
      tags: safeParseTags(p.tags),
    }));
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - create a project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, tags, image, url, sortOrder, category } = body;

    if (!title || !description || !image || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        title,
        description,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        image,
        url,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : null,
        category: category || null,
      },
    });

    return NextResponse.json(
      { ...project, tags: safeParseTags(project.tags) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

function safeParseTags(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
