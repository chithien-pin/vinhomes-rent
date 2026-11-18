import {
  createSessionToken,
  getAdminCredentials,
  setSessionCookie,
} from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const expected = getAdminCredentials();

  if (!expected.configured) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured" },
      { status: 500 }
    );
  }

  if (username !== expected.username || password !== expected.password) {
    return NextResponse.json(
      { error: "Sai tài khoản hoặc mật khẩu" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, await createSessionToken());
  return response;
}
