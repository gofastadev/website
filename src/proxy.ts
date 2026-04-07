import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export function proxy(request: NextRequest) {
  if (!isProduction) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/docs") || pathname === "/sitemap") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
