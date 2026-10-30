import { calculateCosts } from "../src/lib/costs";
import { calculateTieredElectricity } from "../src/lib/electricity";
import { calculateWeightedScore } from "../src/lib/scores";
import { RAINBOW_DEFAULTS } from "../src/lib/constants";

const settings = {
  defaultMgmtFeePerM2: RAINBOW_DEFAULTS.mgmtFeePerM2,
  defaultMgmtFeeBasis: "NET" as const,
  defaultBikeFee: RAINBOW_DEFAULTS.bikeFee,
  defaultMotorbikeFee: RAINBOW_DEFAULTS.motorbikeFee,
  defaultCarFee: RAINBOW_DEFAULTS.carFee,
  defaultEvChargeFee: RAINBOW_DEFAULTS.evChargeFee,
  defaultElectricityPerKwh: null,
  defaultWaterPerM3: RAINBOW_DEFAULTS.waterPerM3,
  defaultLeaseMonths: 12,
};

// Ví dụ user: ~271 kWh → ~652.000 đ (chưa VAT)
const billNoVat = calculateTieredElectricity(270.8, { includeVat: false });
console.assert(
  Math.abs(billNoVat.subtotal - 652_000) < 500,
  `expected ~652000 got ${billNoVat.subtotal}`
);

const billWithVat = calculateTieredElectricity(270.8, { includeVat: true });
console.assert(
  billWithVat.total === Math.round(billNoVat.subtotal * 1.08),
  `VAT total ${billWithVat.total}`
);

const studio = calculateCosts(
  {
    rentMonthly: 6_500_000,
    depositMonths: 2,
    depositAmount: null,
    brokerageFee: 3_250_000,
    rentIncludesMgmt: false,
    mgmtFeePerM2: null,
    mgmtFeeBasis: "NET",
    netAreaM2: 29,
    grossAreaM2: 32,
    bikeCount: 0,
    bikeFee: null,
    motorbikeCount: 1,
    motorbikeFee: null,
    carCount: 0,
    carFee: null,
    evChargeCount: 0,
    evChargeFee: null,
    electricityPerKwh: null,
    electricityKwhMonth: 150,
    waterPerM3: null,
    waterM3Month: 8,
    internetFee: 200_000,
    tvFee: null,
    leaseMonths: 12,
    extras: [],
  },
  settings
);

const expectedMgmt = Math.round(29 * 15400);
console.assert(studio.mgmtFee === expectedMgmt, `mgmt ${studio.mgmtFee}`);
console.assert(studio.electricityEstimated, "electricity estimated via tiers");
console.assert(
  studio.electricityBill?.method === "tiered",
  "tiered method"
);
// 150 kWh: 50*1984 + 50*2050 + 50*2380 = 99200+102500+119000 = 320700; +VAT 8%
const expectedElec = Math.round(320_700 * 1.08);
console.assert(
  studio.electricity === expectedElec,
  `elec ${studio.electricity} != ${expectedElec}`
);
console.assert(studio.waterEstimated, "water estimated");
console.assert(
  studio.water === 8 * 6700,
  `water ${studio.water} != ${8 * 6700}`
);

const score = calculateWeightedScore(
  {
    scorePrice: 4,
    scoreLocation: 4,
    scoreLightView: 5,
    scoreFurniture: 3,
    scoreAmenities: 5,
    scoreSecurity: 5,
    scoreLandlord: 4,
    scoreOverall: 4,
  },
  {
    weightPrice: 20,
    weightLocation: 15,
    weightLightView: 15,
    weightFurniture: 10,
    weightAmenities: 10,
    weightSecurity: 10,
    weightLandlord: 10,
    weightOverall: 10,
  }
);
console.assert(score !== null && score >= 3.5 && score <= 5, `score ${score}`);

console.log("OK — costs, tiers & scores");
console.log({
  example271kwhNoVat: billNoVat.subtotal,
  example271kwhWithVat: billWithVat.total,
  studioElectricity: studio.electricity,
  estimatedMonthly: studio.estimatedMonthly,
});
