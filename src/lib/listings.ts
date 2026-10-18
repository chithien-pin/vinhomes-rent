import type {
  ExtraFee,
  Listing,
  ListingPhoto,
  ListingPoint,
  UserSettings,
} from "@prisma/client";
import { calculateCosts, type CostBreakdown } from "./costs";
import { calculateWeightedScore } from "./scores";
import type { ListingFormValues } from "./validators";

export type ListingWithRelations = Listing & {
  points: ListingPoint[];
  extras: ExtraFee[];
  photos: ListingPhoto[];
};

export type EnrichedListing = ListingWithRelations & {
  costs: CostBreakdown;
  weightedScore: number | null;
};

export function decimalToNumber(
  value: { toNumber?: () => number } | number | null | undefined
): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value);
}

export function toCostInput(listing: ListingWithRelations) {
  return {
    rentMonthly: listing.rentMonthly,
    depositMonths: decimalToNumber(listing.depositMonths),
    depositAmount: listing.depositAmount,
    brokerageFee: listing.brokerageFee,
    rentIncludesMgmt: listing.rentIncludesMgmt,
    mgmtFeePerM2: listing.mgmtFeePerM2,
    mgmtFeeBasis: listing.mgmtFeeBasis,
    netAreaM2: decimalToNumber(listing.netAreaM2),
    grossAreaM2: decimalToNumber(listing.grossAreaM2),
    bikeCount: listing.bikeCount,
    bikeFee: listing.bikeFee,
    motorbikeCount: listing.motorbikeCount,
    motorbikeFee: listing.motorbikeFee,
    carCount: listing.carCount,
    carFee: listing.carFee,
    evChargeCount: listing.evChargeCount,
    evChargeFee: listing.evChargeFee,
    electricityPerKwh: listing.electricityPerKwh,
    electricityKwhMonth: decimalToNumber(listing.electricityKwhMonth),
    waterPerM3: listing.waterPerM3,
    waterM3Month: decimalToNumber(listing.waterM3Month),
    internetFee: listing.internetFee,
    tvFee: listing.tvFee,
    leaseMonths: listing.leaseMonths,
    extras: listing.extras.map((e) => ({ name: e.name, amount: e.amount })),
  };
}

export function enrichListing(
  listing: ListingWithRelations,
  settings: UserSettings
): EnrichedListing {
  const costs = calculateCosts(toCostInput(listing), settings);
  const weightedScore = calculateWeightedScore(listing, settings);
  return { ...listing, costs, weightedScore };
}

export function listingToFormValues(
  listing: ListingWithRelations
): ListingFormValues {
  return {
    title: listing.title,
    project: listing.project,
    building: listing.building,
    unitNumber: listing.unitNumber,
    address: listing.address,
    listingUrl: listing.listingUrl ?? "",
    contactName: listing.contactName,
    contactPhone: listing.contactPhone,
    viewedAt: listing.viewedAt
      ? listing.viewedAt.toISOString().slice(0, 10)
      : "",
    status: listing.status,
    unitType: listing.unitType,
    unitTypeNote: listing.unitTypeNote,
    netAreaM2: decimalToNumber(listing.netAreaM2),
    grossAreaM2: decimalToNumber(listing.grossAreaM2),
    floor: listing.floor,
    doorDirection: listing.doorDirection,
    balconyDirection: listing.balconyDirection,
    viewNote: listing.viewNote,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    furnishing: listing.furnishing,
    furnitureItems: listing.furnitureItems,
    contractType: listing.contractType,
    contractNote: listing.contractNote,
    minLeaseMonths: listing.minLeaseMonths,
    availableFrom: listing.availableFrom
      ? listing.availableFrom.toISOString().slice(0, 10)
      : "",
    rentMonthly: listing.rentMonthly,
    depositMonths: decimalToNumber(listing.depositMonths),
    depositAmount: listing.depositAmount,
    paymentCycle: listing.paymentCycle,
    brokerageFee: listing.brokerageFee,
    rentIncludesMgmt: listing.rentIncludesMgmt,
    mgmtFeePerM2: listing.mgmtFeePerM2,
    mgmtFeeBasis: listing.mgmtFeeBasis,
    bikeCount: listing.bikeCount,
    bikeFee: listing.bikeFee,
    motorbikeCount: listing.motorbikeCount,
    motorbikeFee: listing.motorbikeFee,
    carCount: listing.carCount,
    carFee: listing.carFee,
    evChargeCount: listing.evChargeCount,
    evChargeFee: listing.evChargeFee,
    electricityPerKwh: listing.electricityPerKwh,
    electricityKwhMonth: decimalToNumber(listing.electricityKwhMonth),
    waterPerM3: listing.waterPerM3,
    waterM3Month: decimalToNumber(listing.waterM3Month),
    internetFee: listing.internetFee,
    tvFee: listing.tvFee,
    leaseMonths: listing.leaseMonths,
    scorePrice: listing.scorePrice,
    scoreLocation: listing.scoreLocation,
    scoreLightView: listing.scoreLightView,
    scoreFurniture: listing.scoreFurniture,
    scoreAmenities: listing.scoreAmenities,
    scoreSecurity: listing.scoreSecurity,
    scoreLandlord: listing.scoreLandlord,
    scoreOverall: listing.scoreOverall,
    notes: listing.notes,
    points: listing.points.map((p) => ({
      id: p.id,
      kind: p.kind,
      text: p.text,
      sortOrder: p.sortOrder,
    })),
    extras: listing.extras.map((e) => ({
      id: e.id,
      name: e.name,
      amount: e.amount,
      sortOrder: e.sortOrder,
    })),
  };
}

export function formValuesToPrismaData(values: ListingFormValues) {
  const emptyToNull = (s: string | null | undefined) =>
    !s || s.trim() === "" ? null : s.trim();

  return {
    title: values.title.trim(),
    project: emptyToNull(values.project),
    building: emptyToNull(values.building),
    unitNumber: emptyToNull(values.unitNumber),
    address: emptyToNull(values.address),
    listingUrl: emptyToNull(values.listingUrl),
    contactName: emptyToNull(values.contactName),
    contactPhone: emptyToNull(values.contactPhone),
    viewedAt: values.viewedAt ? new Date(values.viewedAt) : null,
    status: values.status,
    unitType: values.unitType,
    unitTypeNote: emptyToNull(values.unitTypeNote),
    netAreaM2: values.netAreaM2,
    grossAreaM2: values.grossAreaM2,
    floor: values.floor,
    doorDirection: emptyToNull(values.doorDirection),
    balconyDirection: emptyToNull(values.balconyDirection),
    viewNote: emptyToNull(values.viewNote),
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    furnishing: values.furnishing,
    furnitureItems: values.furnitureItems,
    contractType: values.contractType ?? null,
    contractNote: emptyToNull(values.contractNote),
    minLeaseMonths: values.minLeaseMonths,
    availableFrom: values.availableFrom
      ? new Date(values.availableFrom)
      : null,
    rentMonthly: values.rentMonthly,
    depositMonths: values.depositMonths,
    depositAmount: values.depositAmount,
    paymentCycle: values.paymentCycle,
    brokerageFee: values.brokerageFee,
    rentIncludesMgmt: values.rentIncludesMgmt,
    mgmtFeePerM2: values.mgmtFeePerM2,
    mgmtFeeBasis: values.mgmtFeeBasis,
    bikeCount: values.bikeCount ?? 0,
    bikeFee: values.bikeFee,
    motorbikeCount: values.motorbikeCount ?? 0,
    motorbikeFee: values.motorbikeFee,
    carCount: values.carCount ?? 0,
    carFee: values.carFee,
    evChargeCount: values.evChargeCount ?? 0,
    evChargeFee: values.evChargeFee,
    electricityPerKwh: values.electricityPerKwh,
    electricityKwhMonth: values.electricityKwhMonth,
    waterPerM3: values.waterPerM3,
    waterM3Month: values.waterM3Month,
    internetFee: values.internetFee,
    tvFee: values.tvFee,
    leaseMonths: values.leaseMonths,
    scorePrice: values.scorePrice ?? null,
    scoreLocation: values.scoreLocation ?? null,
    scoreLightView: values.scoreLightView ?? null,
    scoreFurniture: values.scoreFurniture ?? null,
    scoreAmenities: values.scoreAmenities ?? null,
    scoreSecurity: values.scoreSecurity ?? null,
    scoreLandlord: values.scoreLandlord ?? null,
    scoreOverall: values.scoreOverall ?? null,
    notes: emptyToNull(values.notes),
  };
}

export const listingInclude = {
  points: { orderBy: { sortOrder: "asc" as const } },
  extras: { orderBy: { sortOrder: "asc" as const } },
  photos: { orderBy: { sortOrder: "asc" as const } },
};
