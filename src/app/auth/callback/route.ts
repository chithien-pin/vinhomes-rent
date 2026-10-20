import { NextResponse } from "next/server";

/** Giữ route cũ — auth hiện dùng cookie admin, không còn OAuth. */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
