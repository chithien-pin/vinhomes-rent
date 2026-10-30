-- Backfill null water rates, then make column required with default 6.700 đ/m³
UPDATE "UserSettings" SET "defaultWaterPerM3" = 6700 WHERE "defaultWaterPerM3" IS NULL;

ALTER TABLE "UserSettings" ALTER COLUMN "defaultWaterPerM3" SET DEFAULT 6700,
ALTER COLUMN "defaultWaterPerM3" SET NOT NULL;
