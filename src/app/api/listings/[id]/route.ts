import { requireApiUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import {
  formValuesToPrismaData,
  listingInclude,
} from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { listingFormSchema } from "@/lib/validators";
import { removeFromStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

async function getOwnedListing(id: string, userId: string) {
  return prisma.listing.findFirst({
    where: { id, userId },
    include: listingInclude,
  });
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const listing = await getOwnedListing(id, user.id);
    if (!listing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }
    return NextResponse.json({ listing, settings: user.settings });
  } catch (error) {
    return apiError(error, "Lỗi tải căn");
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const existing = await getOwnedListing(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = listingFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const values = parsed.data;
    const data = formValuesToPrismaData(values);

    const listing = await prisma.$transaction(async (tx) => {
      await tx.listingPoint.deleteMany({ where: { listingId: id } });
      await tx.extraFee.deleteMany({ where: { listingId: id } });

      return tx.listing.update({
        where: { id },
        data: {
          ...data,
          points: {
            create: values.points
              .filter((p) => p.text.trim())
              .map((p, i) => ({
                kind: p.kind,
                text: p.text.trim(),
                sortOrder: p.sortOrder ?? i,
              })),
          },
          extras: {
            create: values.extras
              .filter((e) => e.name.trim() && e.amount > 0)
              .map((e, i) => ({
                name: e.name.trim(),
                amount: e.amount,
                sortOrder: e.sortOrder ?? i,
              })),
          },
        },
        include: listingInclude,
      });
    });

    return NextResponse.json({ listing });
  } catch (error) {
    return apiError(error, "Không lưu được");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const existing = await getOwnedListing(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    const paths = existing.photos.map((p) => p.storagePath);
    await prisma.listing.delete({ where: { id } });

    if (paths.length) {
      const stillUsed = await prisma.listingPhoto.findMany({
        where: { storagePath: { in: paths } },
        select: { storagePath: true },
      });
      const used = new Set(stillUsed.map((p) => p.storagePath));
      const toRemove = paths.filter((p) => !used.has(p));
      if (toRemove.length) {
        await removeFromStorage(toRemove);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, "Không xóa được");
  }
}
