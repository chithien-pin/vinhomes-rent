import { apiError } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { createSignedUrls } from "@/lib/supabase/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const paths = Array.isArray(body.paths)
      ? body.paths.filter((p: unknown) => typeof p === "string")
      : [];

    // Chỉ cho phép path thuộc user hiện tại
    const allowed = paths.filter((p: string) =>
      p.startsWith(`${user.id}/`)
    );

    const urls = await createSignedUrls(allowed);
    return NextResponse.json({ urls });
  } catch (error) {
    return apiError(error, "Không tạo được URL ảnh");
  }
}
