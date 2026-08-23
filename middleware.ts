import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (adequate for single admin)
const rateLimit = new Map();

export async function middleware(request: NextRequest) {
  // Skip rate limiting for authenticated admin routes
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login"
  ) {
    const session = await auth();
    if (session) {
      return NextResponse.next();
    }
  }

  // Apply rate limiting to login endpoint
  // if (request.nextUrl.pathname === "/admin/login") {
  //   const ip =
  //     request.headers.get("x-forwarded-for") ??
  //     request.headers.get("x-real-ip") ??
  //     "anonymous";
  //   const now = Date.now();
  //   const windowStart = now - 15 * 60 * 1000; // 15 minutes
  //   const attempts = rateLimit.get(ip) || [];

  //   // Clean old attempts
  //   const recentAttempts = attempts.filter(
  //     (time: number) => time > windowStart,
  //   );

  //   if (recentAttempts.length >= 10) {
  //     const url = new URL("/admin/login", request.url);
  //     url.searchParams.set("blocked", "true");
  //     return NextResponse.redirect(url);
  //   }

  //   recentAttempts.push(now);
  //   rateLimit.set(ip, recentAttempts);
  // }

  // Protect admin routes
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname !== "/admin/login"
  ) {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
