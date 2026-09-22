import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/blog/revisions/[postId] - list all revisions for a post, sorted by createdAt DESC
// Returns: id, title, editorName, revisionNote, createdAt
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    if (!/^\d+$/.test(postId)) {
      return NextResponse.json(
        { error: "postId must be numeric" },
        { status: 400 }
      );
    }
    const pid = parseInt(postId, 10);

    const revisions = await db.blogRevision.findMany({
      where: { postId: pid },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        editorName: true,
        revisionNote: true,
        createdAt: true,
      },
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error("Failed to fetch blog revisions:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog revisions" },
      { status: 500 }
    );
  }
}
