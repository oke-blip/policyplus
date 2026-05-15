import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/auth";

// Add paths that require authentication
const protectedPaths = ["/admin"];

// Add paths that should be inaccessible when logged in (like login page)
const authPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Extract the locale if present (e.g., /en/admin -> /admin)
  const segments = pathname.split("/");
  const hasLocale = segments[1]?.length === 2; // Simple check for locale like /en, /id
  const normalizedPath = hasLocale ? "/" + segments.slice(2).join("/") : pathname;

  const session = request.cookies.get("session")?.value;

  // 1. Check if the path is protected
  const isProtected = protectedPaths.some(path => normalizedPath.startsWith(path));
  
  if (isProtected) {
    if (!session) {
      const locale = hasLocale ? segments[1] : "en";
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
    
    try {
      await decrypt(session);
      return NextResponse.next();
    } catch (error) {
      const locale = hasLocale ? segments[1] : "en";
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // 2. Check if the path is an auth path (login)
  const isAuthPath = authPaths.some(path => normalizedPath.startsWith(path));
  
  if (isAuthPath && session) {
    try {
      await decrypt(session);
      const locale = hasLocale ? segments[1] : "en";
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    } catch (error) {
      // Session invalid, let them stay on login
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
