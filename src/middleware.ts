import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Refresh Supabase auth sessions on every request.
  // If Supabase is not configured (missing env vars), this safely returns
  // a plain NextResponse.next() without throwing.
  try {
    const supabaseResponse = createClient(request);
    return supabaseResponse;
  } catch {
    // If anything goes wrong, just pass through — don't block the request.
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets (portfolio images, hero-bg, logo, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|portfolio|uploads|hero-bg|logo|agency|robots|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|css|js|map|txt)).*)",
  ],
};
