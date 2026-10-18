import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function apiError(error: unknown, fallback: string, status = 500) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  console.error(error);
  return NextResponse.json({ error: fallback }, { status });
}
