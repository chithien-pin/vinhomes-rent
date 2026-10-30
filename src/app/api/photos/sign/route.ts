import { apiError } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { createSignedUrls } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();
    const paths = Array.isArray(body.paths)
      ? body.paths.filter((p: unknown) => typeof p === "string")
      : [];

    const urls = await createSignedUrls(paths);
    return NextResponse.json({ urls });
  } catch (error) {
    return apiError(error, "Không lấy được URL ảnh");
  }
}
