import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

import { auth } from "@/auth";

const officialWriteRoutes = [/^\/board\/write\/?$/, /^\/board\/[^/]+\/edit\/?$/];

function loginRedirect(request: NextAuthRequest) {
  const url = new URL("/login", request.nextUrl);
  url.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(url);
}

export const proxy = auth((request) => {
  const user = request.auth?.user;
  const pathname = request.nextUrl.pathname;

  if (!user) {
    return loginRedirect(request);
  }

  if (user.status !== "active") {
    return NextResponse.redirect(new URL("/login?error=inactive", request.url));
  }

  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    officialWriteRoutes.some((route) => route.test(pathname)) &&
    user.role !== "council" &&
    user.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/mypage/:path*",
    "/community/write/:path*",
    "/community/:path*/edit",
    "/board/write/:path*",
    "/board/:path*/edit",
    "/admin/:path*",
  ],
};
