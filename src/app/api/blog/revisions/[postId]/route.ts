import { NextRequest, NextResponse } from "next/server";
import { fetchRevisions } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const data = await fetchRevisions(parseInt(postId, 10));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load revisions:", error);
    return NextResponse.json(
      { error: "Failed to load revisions" },
      { status: 500 }
    );
  }
}
