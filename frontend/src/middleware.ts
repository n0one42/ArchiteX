// src/middleware.ts
import type { NextRequest } from "next/server";

import { paths } from "@/routes/paths";
import { NextResponse } from "next/server";

if (!process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME) {
  throw new Error("NEXT_PUBLIC_AUTH_COOKIE_NAME must be defined");
}

if (!process.env.NEXT_PUBLIC_COOKIE_DOMAIN) {
  throw new Error("NEXT_PUBLIC_COOKIE_DOMAIN must be defined");
}

const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(authCookie);

  // Always allow access to root and static files.
  const isPublicPath = pathname === paths.root || pathname.startsWith("/_next");
  // Also allow unauthenticated access to the sign-in page.
  if (isPublicPath || (!isAuthenticated && pathname === paths.auth.signIn)) {
    return NextResponse.next();
  }

  // Handle sign-out: clear the auth cookie and redirect to home.
  if (pathname === paths.auth.signOut) {
    const response = NextResponse.redirect(new URL(paths.root, request.url));
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      expires: new Date(0),
      path: paths.root,
    });
    return response;
  }

  // If not authenticated and trying to access a protected route,
  // redirect to the sign-in page with the current path and query string.
  if (!isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = paths.auth.signIn;
    redirectUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and trying to access the sign-in page,
  // redirect to a default authenticated route.
  if (pathname === paths.auth.signIn) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = paths.testing.test1;
    return NextResponse.redirect(redirectUrl);
  }

  // For all other cases when authenticated, continue as normal.
  return NextResponse.next();
}

// Optionally restrict the middleware to specific paths.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
