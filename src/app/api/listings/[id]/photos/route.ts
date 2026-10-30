import { requireApiUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { MAX_PHOTOS_PER_LISTING } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { photoMetaSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const listing = await prisma.listing.findFirst({
      where: { id, userId: user.id },
      include: { photos: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    if (listing.photos.length >= MAX_PHOTOS_PER_LISTING) {
      return NextResponse.json(
        { error: `Tối đa ${MAX_PHOTOS_PER_LISTING} ảnh / căn` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { storagePath, ...rest } = body;
    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json({ error: "Thiếu storagePath" }, { status: 400 });
    }
    const okPath =
      storagePath.startsWith(`${user.id}/${id}/`) ||
      storagePath.includes(`/listings/${user.id}/${id}/`);
    if (!okPath) {
      return NextResponse.json({ error: "Path không hợp lệ" }, { status: 400 });
    }

    const meta = photoMetaSchema.safeParse(rest);
    if (!meta.success) {
      return NextResponse.json({ error: "Meta không hợp lệ" }, { status: 400 });
    }

    const maxOrder = listing.photos.reduce(
      (m, p) => Math.max(m, p.sortOrder),
      -1
    );
    const isFirst = listing.photos.length === 0;

    const photo = await prisma.listingPhoto.create({
      data: {
        listingId: id,
        storagePath,
        category: meta.data.category,
        caption: meta.data.caption ?? null,
        sortOrder: meta.data.sortOrder ?? maxOrder + 1,
        isCover: meta.data.isCover ?? isFirst,
      },
    });

    if (photo.isCover) {
      await prisma.listingPhoto.updateMany({
        where: { listingId: id, id: { not: photo.id } },
        data: { isCover: false },
      });
    }

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    return apiError(error, "Không lưu ảnh");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const listing = await prisma.listing.findFirst({
      where: { id, userId: user.id },
    });
    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    const body = await request.json();

    if (Array.isArray(body.order)) {
      await prisma.$transaction(
        body.order.map(
          (item: { id: string; sortOrder: number }, index: number) =>
            prisma.listingPhoto.updateMany({
              where: { id: item.id, listingId: id },
              data: { sortOrder: item.sortOrder ?? index },
            })
        )
      );
      const photos = await prisma.listingPhoto.findMany({
        where: { listingId: id },
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ photos });
    }

    if (body.photoId && body.patch) {
      const meta = photoMetaSchema.partial().safeParse(body.patch);
      if (!meta.success) {
        return NextResponse.json({ error: "Patch không hợp lệ" }, { status: 400 });
      }
      const photo = await prisma.listingPhoto.updateMany({
        where: { id: body.photoId, listingId: id },
        data: meta.data,
      });
      if (photo.count === 0) {
        return NextResponse.json({ error: "Không tìm thấy ảnh" }, { status: 404 });
      }
      if (meta.data.isCover) {
        await prisma.listingPhoto.updateMany({
          where: { listingId: id, id: { not: body.photoId } },
          data: { isCover: false },
        });
      }
      const photos = await prisma.listingPhoto.findMany({
        where: { listingId: id },
        orderBy: { sortOrder: "asc" },
      });
      return NextResponse.json({ photos });
    }

    return NextResponse.json({ error: "Payload không hợp lệ" }, { status: 400 });
  } catch (error) {
    return apiError(error, "Không cập nhật ảnh");
  }
}
