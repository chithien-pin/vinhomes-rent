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
  const { username: expectedUser, password: expectedPass } =
    getAdminCredentials();

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json(
      { error: "Sai tài khoản hoặc mật khẩu" },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, token);
  return response;
}
