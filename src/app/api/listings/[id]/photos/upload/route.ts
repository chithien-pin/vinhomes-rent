import { apiError } from "@/lib/api";
import { requireApiUser } from "@/lib/auth";
import { MAX_PHOTOS_PER_LISTING, STORAGE_BUCKET } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { uploadToStorage } from "@/lib/supabase/storage";
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

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
    }

    const photoId = crypto.randomUUID();
    const storagePath = `${user.id}/${id}/${photoId}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToStorage(storagePath, buffer, "image/jpeg");

    const maxOrder = listing.photos.reduce(
      (m, p) => Math.max(m, p.sortOrder),
      -1
    );
    const isFirst = listing.photos.length === 0;

    const photo = await prisma.listingPhoto.create({
      data: {
        listingId: id,
        storagePath,
        sortOrder: maxOrder + 1,
        isCover: isFirst,
      },
    });

    return NextResponse.json({ photo, bucket: STORAGE_BUCKET }, { status: 201 });
  } catch (error) {
    return apiError(error, "Upload ảnh thất bại");
  }
}
