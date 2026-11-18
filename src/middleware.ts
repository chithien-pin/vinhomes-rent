import { isLoggedInFromRequest } from "@/lib/session";
import { NextResponse, type NextRequest } from "next/server";

function isPublicAsset(path: string) {
  return (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path === "/manifest.webmanifest" ||
    /\.[a-z0-9]+$/i.test(path)
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loggedIn = await isLoggedInFromRequest(request);

  if (loggedIn && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/login") || path.startsWith("/api/auth") || isPublicAsset(path)) {
    return NextResponse.next();
  }

  if (!loggedIn) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path === "/" ? "/" : path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
