import { requireApiUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { listingInclude } from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { listingFormSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status");
    const unitType = searchParams.get("unitType");
    const minRent = searchParams.get("minRent");
    const maxRent = searchParams.get("maxRent");

    const listings = await prisma.listing.findMany({
      where: {
        userId: user.id,
        ...(status ? { status: status as never } : {}),
        ...(unitType ? { unitType: unitType as never } : {}),
        ...(minRent || maxRent
          ? {
              rentMonthly: {
                ...(minRent ? { gte: Number(minRent) } : {}),
                ...(maxRent ? { lte: Number(maxRent) } : {}),
              },
            }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { project: { contains: q, mode: "insensitive" } },
                { building: { contains: q, mode: "insensitive" } },
                { address: { contains: q, mode: "insensitive" } },
                { unitNumber: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: listingInclude,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ listings, settings: user.settings });
  } catch (error) {
    return apiError(error, "Không tải được danh sách");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = await request.json().catch(() => ({}));
    const settings = user.settings!;

    if (body.full) {
      const parsed = listingFormSchema.safeParse(body.full);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const values = parsed.data;
      const { formValuesToPrismaData } = await import("@/lib/listings");
      const data = formValuesToPrismaData(values);
      const listing = await prisma.listing.create({
        data: {
          ...data,
          userId: user.id,
          mgmtFeePerM2: data.mgmtFeePerM2 ?? settings.defaultMgmtFeePerM2,
          bikeFee: data.bikeFee ?? settings.defaultBikeFee,
          motorbikeFee: data.motorbikeFee ?? settings.defaultMotorbikeFee,
          carFee: data.carFee ?? settings.defaultCarFee,
          evChargeFee: data.evChargeFee ?? settings.defaultEvChargeFee,
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
      return NextResponse.json({ listing }, { status: 201 });
    }

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Căn mới";

    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        title,
        mgmtFeePerM2: settings.defaultMgmtFeePerM2,
        mgmtFeeBasis: settings.defaultMgmtFeeBasis,
        bikeFee: settings.defaultBikeFee,
        motorbikeFee: settings.defaultMotorbikeFee,
        carFee: settings.defaultCarFee,
        evChargeFee: settings.defaultEvChargeFee,
        furnitureItems: [],
      },
      include: listingInclude,
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    return apiError(error, "Không tạo được căn hộ");
  }
}
