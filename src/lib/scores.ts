import type { SCORE_CRITERIA } from "./constants";

export type ScoreWeights = {
  weightPrice: number;
  weightLocation: number;
  weightLightView: number;
  weightFurniture: number;
  weightAmenities: number;
  weightSecurity: number;
  weightLandlord: number;
  weightOverall: number;
};

export type ScoreValues = {
  scorePrice: number | null;
  scoreLocation: number | null;
  scoreLightView: number | null;
  scoreFurniture: number | null;
  scoreAmenities: number | null;
  scoreSecurity: number | null;
  scoreLandlord: number | null;
  scoreOverall: number | null;
};

type CriterionKey = (typeof SCORE_CRITERIA)[number]["key"];
type WeightKey = (typeof SCORE_CRITERIA)[number]["weightKey"];

const PAIRS: { score: CriterionKey; weight: WeightKey }[] = [
  { score: "scorePrice", weight: "weightPrice" },
  { score: "scoreLocation", weight: "weightLocation" },
  { score: "scoreLightView", weight: "weightLightView" },
  { score: "scoreFurniture", weight: "weightFurniture" },
  { score: "scoreAmenities", weight: "weightAmenities" },
  { score: "scoreSecurity", weight: "weightSecurity" },
  { score: "scoreLandlord", weight: "weightLandlord" },
  { score: "scoreOverall", weight: "weightOverall" },
];

/** Weighted average of rated criteria only (1–5). Returns null if none rated. */
export function calculateWeightedScore(
  scores: ScoreValues,
  weights: ScoreWeights
): number | null {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const { score, weight } of PAIRS) {
    const value = scores[score];
    const w = weights[weight];
    if (value == null || w <= 0) continue;
    if (value < 1 || value > 5) continue;
    weightedSum += value * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}
