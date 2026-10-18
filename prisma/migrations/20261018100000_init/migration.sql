-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('INTERESTED', 'VIEWED', 'REJECTED', 'CHOSEN');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('STUDIO', 'ONE_BR', 'ONE_BR_PLUS', 'TWO_BR', 'THREE_BR', 'OTHER');

-- CreateEnum
CREATE TYPE "Furnishing" AS ENUM ('NONE', 'BASIC', 'FULL');

-- CreateEnum
CREATE TYPE "AreaBasis" AS ENUM ('NET', 'GROSS');

-- CreateEnum
CREATE TYPE "PaymentCycle" AS ENUM ('MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('OWNER', 'AUTHORIZED', 'LONG_TERM', 'OTHER');

-- CreateEnum
CREATE TYPE "PointKind" AS ENUM ('PRO', 'CON');

-- CreateEnum
CREATE TYPE "PhotoCategory" AS ENUM ('LIVING', 'BEDROOM', 'KITCHEN', 'BATHROOM', 'BALCONY_VIEW', 'HALL_BUILDING', 'DOCUMENTS', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightPrice" INTEGER NOT NULL DEFAULT 20,
    "weightLocation" INTEGER NOT NULL DEFAULT 15,
    "weightLightView" INTEGER NOT NULL DEFAULT 15,
    "weightFurniture" INTEGER NOT NULL DEFAULT 10,
    "weightAmenities" INTEGER NOT NULL DEFAULT 10,
    "weightSecurity" INTEGER NOT NULL DEFAULT 10,
    "weightLandlord" INTEGER NOT NULL DEFAULT 10,
    "weightOverall" INTEGER NOT NULL DEFAULT 10,
    "defaultMgmtFeePerM2" INTEGER NOT NULL DEFAULT 15400,
    "defaultMgmtFeeBasis" "AreaBasis" NOT NULL DEFAULT 'NET',
    "defaultBikeFee" INTEGER NOT NULL DEFAULT 29455,
    "defaultMotorbikeFee" INTEGER NOT NULL DEFAULT 147273,
    "defaultCarFee" INTEGER NOT NULL DEFAULT 1227273,
    "defaultEvChargeFee" INTEGER NOT NULL DEFAULT 165000,
    "defaultElectricityPerKwh" INTEGER,
    "defaultWaterPerM3" INTEGER,
    "defaultLeaseMonths" INTEGER NOT NULL DEFAULT 12,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "project" TEXT,
    "building" TEXT,
    "unitNumber" TEXT,
    "address" TEXT,
    "listingUrl" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "viewedAt" TIMESTAMP(3),
    "status" "ListingStatus" NOT NULL DEFAULT 'INTERESTED',
    "unitType" "UnitType" NOT NULL DEFAULT 'TWO_BR',
    "unitTypeNote" TEXT,
    "netAreaM2" DECIMAL(8,2),
    "grossAreaM2" DECIMAL(8,2),
    "floor" INTEGER,
    "doorDirection" TEXT,
    "balconyDirection" TEXT,
    "viewNote" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "furnishing" "Furnishing" NOT NULL DEFAULT 'NONE',
    "furnitureItems" TEXT[],
    "contractType" "ContractType",
    "contractNote" TEXT,
    "minLeaseMonths" INTEGER,
    "availableFrom" TIMESTAMP(3),
    "rentMonthly" INTEGER,
    "depositMonths" DECIMAL(4,1),
    "depositAmount" INTEGER,
    "paymentCycle" "PaymentCycle" NOT NULL DEFAULT 'MONTHLY',
    "brokerageFee" INTEGER,
    "rentIncludesMgmt" BOOLEAN NOT NULL DEFAULT false,
    "mgmtFeePerM2" INTEGER,
    "mgmtFeeBasis" "AreaBasis" NOT NULL DEFAULT 'NET',
    "bikeCount" INTEGER NOT NULL DEFAULT 0,
    "bikeFee" INTEGER,
    "motorbikeCount" INTEGER NOT NULL DEFAULT 0,
    "motorbikeFee" INTEGER,
    "carCount" INTEGER NOT NULL DEFAULT 0,
    "carFee" INTEGER,
    "evChargeCount" INTEGER NOT NULL DEFAULT 0,
    "evChargeFee" INTEGER,
    "electricityPerKwh" INTEGER,
    "electricityKwhMonth" DECIMAL(8,1),
    "waterPerM3" INTEGER,
    "waterM3Month" DECIMAL(8,1),
    "internetFee" INTEGER,
    "tvFee" INTEGER,
    "leaseMonths" INTEGER,
    "scorePrice" INTEGER,
    "scoreLocation" INTEGER,
    "scoreLightView" INTEGER,
    "scoreFurniture" INTEGER,
    "scoreAmenities" INTEGER,
    "scoreSecurity" INTEGER,
    "scoreLandlord" INTEGER,
    "scoreOverall" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPoint" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "kind" "PointKind" NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListingPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraFee" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExtraFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPhoto" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "category" "PhotoCategory" NOT NULL DEFAULT 'OTHER',
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Listing_userId_status_idx" ON "Listing"("userId", "status");

-- CreateIndex
CREATE INDEX "Listing_userId_updatedAt_idx" ON "Listing"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ListingPoint_listingId_kind_sortOrder_idx" ON "ListingPoint"("listingId", "kind", "sortOrder");

-- CreateIndex
CREATE INDEX "ListingPhoto_listingId_sortOrder_idx" ON "ListingPhoto"("listingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPoint" ADD CONSTRAINT "ListingPoint_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraFee" ADD CONSTRAINT "ExtraFee_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPhoto" ADD CONSTRAINT "ListingPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

