import type { AreaBasis } from "@prisma/client";

export type CostSettings = {
  defaultMgmtFeePerM2: number;
  defaultMgmtFeeBasis: AreaBasis;
  defaultBikeFee: number;
  defaultMotorbikeFee: number;
  defaultCarFee: number;
  defaultEvChargeFee: number;
  defaultElectricityPerKwh: number | null;
  defaultWaterPerM3: number | null;
  defaultLeaseMonths: number;
};

export type CostListingInput = {
  rentMonthly: number | null;
  depositMonths: number | null;
  depositAmount: number | null;
  brokerageFee: number | null;
  rentIncludesMgmt: boolean;
  mgmtFeePerM2: number | null;
  mgmtFeeBasis: AreaBasis;
  netAreaM2: number | null;
  grossAreaM2: number | null;
  bikeCount: number;
  bikeFee: number | null;
  motorbikeCount: number;
  motorbikeFee: number | null;
  carCount: number;
  carFee: number | null;
  evChargeCount: number;
  evChargeFee: number | null;
  electricityPerKwh: number | null;
  electricityKwhMonth: number | null;
  waterPerM3: number | null;
  waterM3Month: number | null;
  internetFee: number | null;
  tvFee: number | null;
  leaseMonths: number | null;
  extras: { name: string; amount: number }[];
};

export type CostBreakdown = {
  rent: number;
  mgmtFee: number;
  mgmtFeeIncludedInRent: boolean;
  parkingBike: number;
  parkingMotorbike: number;
  parkingCar: number;
  parkingTotal: number;
  evCharge: number;
  internet: number;
  tv: number;
  extrasTotal: number;
  extras: { name: string; amount: number }[];
  fixedMonthly: number;
  electricity: number | null;
  water: number | null;
  estimatedMonthly: number;
  deposit: number;
  brokerage: number;
  moveInCost: number;
  leaseMonths: number;
  contractFixed: number;
  contractEstimated: number;
  electricityEstimated: boolean;
  waterEstimated: boolean;
};

function n(value: number | null | undefined, fallback = 0): number {
  return value == null || Number.isNaN(value) ? fallback : value;
}

function resolveFee(
  listingValue: number | null | undefined,
  defaultValue: number | null | undefined
): number {
  if (listingValue != null) return listingValue;
  return n(defaultValue);
}

export function calculateCosts(
  listing: CostListingInput,
  settings: CostSettings
): CostBreakdown {
  const rent = n(listing.rentMonthly);
  const mgmtPerM2 = resolveFee(
    listing.mgmtFeePerM2,
    settings.defaultMgmtFeePerM2
  );
  const basis = listing.mgmtFeeBasis ?? settings.defaultMgmtFeeBasis;
  const area =
    basis === "GROSS"
      ? listing.grossAreaM2 ?? listing.netAreaM2
      : listing.netAreaM2 ?? listing.grossAreaM2;
  const mgmtFee =
    area != null && mgmtPerM2 > 0 ? Math.round(area * mgmtPerM2) : 0;

  const bikeFee = resolveFee(listing.bikeFee, settings.defaultBikeFee);
  const motorbikeFee = resolveFee(
    listing.motorbikeFee,
    settings.defaultMotorbikeFee
  );
  const carFee = resolveFee(listing.carFee, settings.defaultCarFee);
  const evFee = resolveFee(listing.evChargeFee, settings.defaultEvChargeFee);

  const parkingBike = listing.bikeCount * bikeFee;
  const parkingMotorbike = listing.motorbikeCount * motorbikeFee;
  const parkingCar = listing.carCount * carFee;
  const parkingTotal = parkingBike + parkingMotorbike + parkingCar;
  const evCharge = listing.evChargeCount * evFee;

  const internet = n(listing.internetFee);
  const tv = n(listing.tvFee);
  const extras = listing.extras ?? [];
  const extrasTotal = extras.reduce((sum, e) => sum + n(e.amount), 0);

  const mgmtAdded = listing.rentIncludesMgmt ? 0 : mgmtFee;
  const fixedMonthly =
    rent +
    mgmtAdded +
    parkingTotal +
    evCharge +
    internet +
    tv +
    extrasTotal;

  const elecRate =
    listing.electricityPerKwh ?? settings.defaultElectricityPerKwh;
  const waterRate = listing.waterPerM3 ?? settings.defaultWaterPerM3;
  const electricityEstimated =
    elecRate != null && listing.electricityKwhMonth != null;
  const waterEstimated = waterRate != null && listing.waterM3Month != null;
  const electricity = electricityEstimated
    ? Math.round(elecRate! * listing.electricityKwhMonth!)
    : null;
  const water = waterEstimated
    ? Math.round(waterRate! * listing.waterM3Month!)
    : null;

  const estimatedMonthly =
    fixedMonthly + n(electricity) + n(water);

  const deposit =
    listing.depositAmount != null
      ? listing.depositAmount
      : Math.round(n(listing.depositMonths) * rent);
  const brokerage = n(listing.brokerageFee);
  const moveInCost = deposit + rent + brokerage;

  const leaseMonths = listing.leaseMonths ?? settings.defaultLeaseMonths;
  const contractFixed = fixedMonthly * leaseMonths + deposit + brokerage;
  const contractEstimated =
    estimatedMonthly * leaseMonths + deposit + brokerage;

  return {
    rent,
    mgmtFee,
    mgmtFeeIncludedInRent: listing.rentIncludesMgmt,
    parkingBike,
    parkingMotorbike,
    parkingCar,
    parkingTotal,
    evCharge,
    internet,
    tv,
    extrasTotal,
    extras,
    fixedMonthly,
    electricity,
    water,
    estimatedMonthly,
    deposit,
    brokerage,
    moveInCost,
    leaseMonths,
    contractFixed,
    contractEstimated,
    electricityEstimated,
    waterEstimated,
  };
}
