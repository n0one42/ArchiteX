// src/middleware.ts
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip middleware for static files or if already on /sign-in
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Check for the authentication cookie
  const authCookie = req.cookies.get("AspNetCoreIdentityApplication")?.value;
  if (!authCookie) {
    // Clone the current URL to modify it
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    // Append the originally requested URL as a query parameter
    redirectUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated, let the request continue
  return NextResponse.next();
}

// Optionally restrict the middleware to specific paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
