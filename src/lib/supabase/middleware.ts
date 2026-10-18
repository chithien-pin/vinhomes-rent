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

  // Bắt buộc gọi getUser() để refresh session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") || path.startsWith("/auth");
  const isPublicAsset =
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.includes(".");

  if (!user && !isAuthRoute && !isPublicAsset) {
    const urlRedirect = request.nextUrl.clone();
    urlRedirect.pathname = "/login";
    urlRedirect.searchParams.set("next", path);
    return NextResponse.redirect(urlRedirect);
  }

  if (user && path === "/login") {
    const urlRedirect = request.nextUrl.clone();
    urlRedirect.pathname = "/";
    return NextResponse.redirect(urlRedirect);
  }

  return supabaseResponse;
}
