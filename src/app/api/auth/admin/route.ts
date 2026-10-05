import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = "@#$&16609";

// POST /api/auth/admin - verify admin password
// Body: { password }
// Returns { success: true, token: "admin-session-active" } if match,
// or { success: false } with 401 status otherwise.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body || {};

    if (typeof password !== "string" || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: "admin-session-active",
    });
  } catch (error) {
    console.error("Failed to verify admin password:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
