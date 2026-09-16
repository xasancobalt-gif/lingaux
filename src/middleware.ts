import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// LINGAUX middleware — P0: server-side route protection.
// Frontend hiding is NOT authentication: every /dashboard, /studio, /reviews/*
// /practice /community /messages /profile /settings /billing /referrals must be
// gated here with a verified session token BEFORE the page component runs.
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    const url = new URL("/?auth=signin", origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/studio/:path*",
    "/reviews/:path*",
    "/practice/:path*",
    "/community/:path*",
    "/messages/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/referrals/:path*",
  ],
};