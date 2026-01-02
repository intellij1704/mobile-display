import { NextResponse } from "next/server";

export function middleware(req) {
  const isUnderConstruction = false; // toggle if needed
  const { pathname } = req.nextUrl;

  // Allow Next.js internals, APIs, and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Redirect all routes to /under-construction if enabled
  if (isUnderConstruction && pathname !== "/under-construction") {
    return NextResponse.redirect(new URL("/under-construction", req.url));
  }

  // Prevent access to /under-construction when disabled
  if (!isUnderConstruction && pathname === "/under-construction") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

/**
 * 🔑 IMPORTANT:
 * Limit middleware to page routes only.
 * This prevents Server Component crashes.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
