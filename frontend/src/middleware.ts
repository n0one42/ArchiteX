// src/middleware.ts
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "AspNetCoreIdentityApplication";
const COOKIE_DOMAIN = ".mydom.com";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(authCookie);

  // Always allow access to root and static files.
  const isPublicPath = pathname === "/" || pathname.startsWith("/_next");
  // Also allow unauthenticated access to the sign-in page.
  if (isPublicPath || (!isAuthenticated && pathname === "/sign-in")) {
    return NextResponse.next();
  }

  // Handle sign-out: clear the auth cookie and redirect to home.
  if (pathname === "/sign-out") {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      domain: COOKIE_DOMAIN,
      expires: new Date(0),
      path: "/",
    });
    return response;
  }

  // If not authenticated and trying to access a protected route,
  // redirect to the sign-in page with the current path and query string.
  if (!isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and trying to access the sign-in page,
  // redirect to a default authenticated route.
  if (pathname === "/sign-in") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/testing/test1";
    return NextResponse.redirect(redirectUrl);
  }

  // For all other cases when authenticated, continue as normal.
  return NextResponse.next();
}

// Optionally restrict the middleware to specific paths.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
