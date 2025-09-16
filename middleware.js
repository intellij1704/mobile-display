import { NextResponse } from "next/server";

export function middleware(req) {
  const isUnderConstruction = false; // toggle this
  const { pathname } = req.nextUrl;

  // Always allow Next.js internals, API routes, favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // If under construction is ON → redirect all routes (except /under-construction) to under-construction page
  if (isUnderConstruction && pathname !== "/under-construction") {
    const underConstructionUrl = new URL("/under-construction", req.url);
    return NextResponse.redirect(underConstructionUrl);
  }

  // If under construction is OFF → redirect /under-construction to home
  if (!isUnderConstruction && pathname === "/under-construction") {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}
