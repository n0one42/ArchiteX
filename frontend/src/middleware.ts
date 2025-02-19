import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export function middleware(request: NextRequest) {
  // const res = NextResponse.next();
  // res.cookies.set("newCookie", "004");

  console.log("response.cookies", cookies());

  const authCookie = request.cookies.get("AspNetCoreIdentityApplication");
  console.log("authCookie", authCookie);
}
