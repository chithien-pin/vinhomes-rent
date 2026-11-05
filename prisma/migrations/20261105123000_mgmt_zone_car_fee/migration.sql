ALTER TABLE "Listing" ADD COLUMN "mgmtZone" TEXT;

ALTER TABLE "UserSettings" ALTER COLUMN "defaultCarFee" SET DEFAULT 2000000;
ALTER TABLE "UserSettings" ALTER COLUMN "defaultMgmtFeePerM2" SET DEFAULT 17000;

-- Đơn giá ô tô cũ → 2 triệu/tháng
UPDATE "UserSettings"
SET "defaultCarFee" = 2000000
WHERE "defaultCarFee" = 1227273;

UPDATE "Listing"
SET "carFee" = 2000000
WHERE "carFee" = 1227273;

-- 15.400 trước đây là mặc định Rainbow; Rainbow hiện là 17.000
UPDATE "UserSettings"
SET "defaultMgmtFeePerM2" = 17000
WHERE "defaultMgmtFeePerM2" = 15400;
