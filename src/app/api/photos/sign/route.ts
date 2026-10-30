import { apiError } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { resolvePhotoUrls } from "@/lib/storage";
import { NextResponse } from "next/server";

/** Vercel Blob URL đã public — chỉ trả về nguyên URL đã lưu. */
export async function POST(request: Request) {
  try {
    await requireApiUser();
    const body = await request.json();
    const paths = Array.isArray(body.paths)
      ? body.paths.filter((p: unknown) => typeof p === "string")
      : [];

    return NextResponse.json({ urls: resolvePhotoUrls(paths) });
  } catch (error) {
    return apiError(error, "Không lấy được URL ảnh");
  }
}
