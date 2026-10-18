import { requireApiUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { formValuesToPrismaData, listingInclude } from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { getRainbowSeedListings } from "@/lib/seed-data";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await requireApiUser();
    const seeds = getRainbowSeedListings();
    const created = [];

    for (const values of seeds) {
      const data = formValuesToPrismaData(values);
      const listing = await prisma.listing.create({
        data: {
          ...data,
          userId: user.id,
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
      created.push(listing);
    }

    return NextResponse.json({ listings: created }, { status: 201 });
  } catch (error) {
    return apiError(error, "Không tạo dữ liệu mẫu");
  }
}
