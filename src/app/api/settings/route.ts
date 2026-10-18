import { requireApiUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { settingsFormSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireApiUser();
    return NextResponse.json({ settings: user.settings });
  } catch (error) {
    return apiError(error, "Lỗi tải cài đặt");
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json();
    const parsed = settingsFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const settings = await prisma.userSettings.update({
      where: { userId: user.id },
      data: parsed.data,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return apiError(error, "Không lưu cài đặt");
  }
}
