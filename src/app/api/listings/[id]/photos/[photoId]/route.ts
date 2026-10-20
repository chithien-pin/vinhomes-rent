import { requireApiUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { removeFromStorage } from "@/lib/supabase/storage";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string; photoId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id, photoId } = await params;
    const listing = await prisma.listing.findFirst({
      where: { id, userId: user.id },
    });
    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    const photo = await prisma.listingPhoto.findFirst({
      where: { id: photoId, listingId: id },
    });
    if (!photo) {
      return NextResponse.json({ error: "Không tìm thấy ảnh" }, { status: 404 });
    }

    await prisma.listingPhoto.delete({ where: { id: photoId } });

    if (photo.isCover) {
      const next = await prisma.listingPhoto.findFirst({
        where: { listingId: id },
        orderBy: { sortOrder: "asc" },
      });
      if (next) {
        await prisma.listingPhoto.update({
          where: { id: next.id },
          data: { isCover: true },
        });
      }
    }

    const stillUsed = await prisma.listingPhoto.count({
      where: { storagePath: photo.storagePath },
    });
    if (stillUsed === 0) {
      await removeFromStorage([photo.storagePath]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "Không xóa ảnh");
  }
}
