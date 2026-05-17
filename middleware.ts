import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/auth";

const protectedPaths = ["/admin"];
const authPaths = ["/login"];

function stripLegacyLocalePrefix(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "en" && segments[0] !== "id") return null;
  const rest = segments.slice(1).join("/");
  return rest ? `/${rest}` : "/";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyPath = stripLegacyLocalePrefix(pathname);
  if (legacyPath !== null) {
    return NextResponse.redirect(new URL(legacyPath, request.url));
  }

  const session = request.cookies.get("session")?.value;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      await decrypt(session);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPath && session) {
    try {
      await decrypt(session);
      return NextResponse.redirect(new URL("/admin", request.url));
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
