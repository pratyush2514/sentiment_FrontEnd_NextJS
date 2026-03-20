import { NextRequest, NextResponse } from "next/server";
import { ROUTES, AUTH_COOKIE_NAME } from "@/lib/constants";
import { getSessionFromRequest } from "@/lib/auth";

function isProtectedPath(pathname: string): boolean {
  return pathname === ROUTES.SETUP || pathname.startsWith(`${ROUTES.DASHBOARD}`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const rawCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
  const session = await getSessionFromRequest(request);

  if (pathname === ROUTES.CONNECT && session) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  if (!session && isProtectedPath(pathname)) {
    const response = NextResponse.redirect(new URL(ROUTES.CONNECT, request.url));
    // Clear stale/expired/invalid cookie if one exists
    if (rawCookie) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/connect", "/setup", "/dashboard/:path*"],
};
