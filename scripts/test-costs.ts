import { calculateCosts } from "../src/lib/costs";
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
  defaultWaterPerM3: null,
  defaultLeaseMonths: 12,
};

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

const expectedMgmt = Math.round(29 * 15400); // 446_600
console.assert(studio.mgmtFee === expectedMgmt, `mgmt ${studio.mgmtFee} != ${expectedMgmt}`);
console.assert(studio.parkingMotorbike === 147273, "motorbike fee");
console.assert(
  studio.fixedMonthly ===
    6_500_000 + expectedMgmt + 147273 + 200_000,
  `fixed ${studio.fixedMonthly}`
);
console.assert(!studio.electricityEstimated, "electricity not estimated without rate");
console.assert(studio.deposit === 13_000_000, "deposit 2 months");
console.assert(
  studio.moveInCost === 13_000_000 + 6_500_000 + 3_250_000,
  "move-in"
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

console.log("OK — costs & scores");
console.log({
  mgmtFee: studio.mgmtFee,
  fixedMonthly: studio.fixedMonthly,
  estimatedMonthly: studio.estimatedMonthly,
  moveInCost: studio.moveInCost,
  weightedScore: score,
});
