import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const path = request.nextUrl.pathname;
  const code = request.nextUrl.searchParams.get("code");

  // Supabase đôi khi trả ?code= về Site URL (/) thay vì /auth/callback.
  // Middleware cũ đẩy sang /login?code=... → không đổi được session.
  if (code && !path.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    const nextParam = request.nextUrl.searchParams.get("next");
    if (!nextParam || nextParam === path) {
      url.searchParams.set("next", "/");
    }
    return NextResponse.redirect(url);
  }

  // Bắt buộc gọi getUser() để refresh session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    path.startsWith("/login") || path.startsWith("/auth");
  const isPublicAsset =
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.includes(".");

  if (!user && !isAuthRoute && !isPublicAsset) {
    const urlRedirect = request.nextUrl.clone();
    urlRedirect.pathname = "/login";
    urlRedirect.searchParams.delete("code");
    urlRedirect.searchParams.set("next", path === "/" ? "/" : path);
    return NextResponse.redirect(urlRedirect);
  }

  if (user && path === "/login") {
    const urlRedirect = request.nextUrl.clone();
    urlRedirect.pathname = "/";
    urlRedirect.search = "";
    return NextResponse.redirect(urlRedirect);
  }

  return supabaseResponse;
}
