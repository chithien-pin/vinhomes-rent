import { requireApiUser } from "@/lib/auth";
import { apiError } from "@/lib/api";
import { listingInclude } from "@/lib/listings";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const source = await prisma.listing.findFirst({
      where: { id, userId: user.id },
      include: listingInclude,
    });
    if (!source) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    const { points, extras, photos } = source;

    const listing = await prisma.listing.create({
      data: {
        title: `${source.title} (bản sao)`,
        project: source.project,
        building: source.building,
        unitNumber: source.unitNumber,
        address: source.address,
        listingUrl: source.listingUrl,
        contactName: source.contactName,
        contactPhone: source.contactPhone,
        viewedAt: source.viewedAt,
        status: source.status,
        unitType: source.unitType,
        unitTypeNote: source.unitTypeNote,
        netAreaM2: source.netAreaM2,
        grossAreaM2: source.grossAreaM2,
        floor: source.floor,
        doorDirection: source.doorDirection,
        balconyDirection: source.balconyDirection,
        viewNote: source.viewNote,
        bedrooms: source.bedrooms,
        bathrooms: source.bathrooms,
        furnishing: source.furnishing,
        furnitureItems: source.furnitureItems,
        contractType: source.contractType,
        contractNote: source.contractNote,
        minLeaseMonths: source.minLeaseMonths,
        availableFrom: source.availableFrom,
        rentMonthly: source.rentMonthly,
        depositMonths: source.depositMonths,
        depositAmount: source.depositAmount,
        paymentCycle: source.paymentCycle,
        brokerageFee: source.brokerageFee,
        rentIncludesMgmt: source.rentIncludesMgmt,
        mgmtFeePerM2: source.mgmtFeePerM2,
        mgmtFeeBasis: source.mgmtFeeBasis,
        bikeCount: source.bikeCount,
        bikeFee: source.bikeFee,
        motorbikeCount: source.motorbikeCount,
        motorbikeFee: source.motorbikeFee,
        carCount: source.carCount,
        carFee: source.carFee,
        evChargeCount: source.evChargeCount,
        evChargeFee: source.evChargeFee,
        electricityPerKwh: source.electricityPerKwh,
        electricityKwhMonth: source.electricityKwhMonth,
        waterPerM3: source.waterPerM3,
        waterM3Month: source.waterM3Month,
        internetFee: source.internetFee,
        tvFee: source.tvFee,
        leaseMonths: source.leaseMonths,
        scorePrice: source.scorePrice,
        scoreLocation: source.scoreLocation,
        scoreLightView: source.scoreLightView,
        scoreFurniture: source.scoreFurniture,
        scoreAmenities: source.scoreAmenities,
        scoreSecurity: source.scoreSecurity,
        scoreLandlord: source.scoreLandlord,
        scoreOverall: source.scoreOverall,
        notes: source.notes,
        userId: user.id,
        points: {
          create: points.map((p) => ({
            kind: p.kind,
            text: p.text,
            sortOrder: p.sortOrder,
          })),
        },
        extras: {
          create: extras.map((e) => ({
            name: e.name,
            amount: e.amount,
            sortOrder: e.sortOrder,
          })),
        },
        photos: {
          create: photos.map((p) => ({
            storagePath: p.storagePath,
            category: p.category,
            caption: p.caption,
            sortOrder: p.sortOrder,
            isCover: p.isCover,
          })),
        },
      },
      include: listingInclude,
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    return apiError(error, "Không nhân bản được");
  }
}
