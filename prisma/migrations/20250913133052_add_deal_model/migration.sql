/*
  Warnings:

  - You are about to drop the column `scope` on the `MillRateHistory` table. All the data in the column will be lost.
  - You are about to drop the column `county` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `mailingCity` on the `Property` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[placeId,year]` on the table `MillRateHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."DealStage" AS ENUM ('LEAD', 'UNDER_CONTRACT', 'DUE_DILIGENCE', 'CLOSING', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "public"."DealStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'CANCELLED');

-- AlterEnum
ALTER TYPE "public"."PlaceKind" ADD VALUE 'CITY';

-- DropIndex
DROP INDEX "public"."MillRateHistory_placeId_year_scope_key";

-- DropIndex
DROP INDEX "public"."MillRateHistory_scope_idx";

-- DropIndex
DROP INDEX "public"."Place_kind_idx";

-- AlterTable
ALTER TABLE "public"."MillRateHistory" DROP COLUMN "scope";

-- AlterTable
ALTER TABLE "public"."Place" DROP COLUMN "county",
ADD COLUMN     "countyId" TEXT,
ADD COLUMN     "statePlaceId" TEXT;

-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "mailingCity";

-- DropEnum
DROP TYPE "public"."MillRateScope";

-- CreateTable
CREATE TABLE "public"."Deal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dealStage" "public"."DealStage" NOT NULL DEFAULT 'LEAD',
    "dealStatus" "public"."DealStatus" NOT NULL DEFAULT 'ACTIVE',
    "targetClosingDate" TIMESTAMP(3),
    "dealNotes" TEXT,
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "acres" DECIMAL(65,30),
    "zoning" TEXT,
    "askingPrice" DECIMAL(65,30),
    "offerPrice" DECIMAL(65,30),
    "earnestMoney" DECIMAL(65,30),
    "estimatedClosingCosts" DECIMAL(65,30),
    "purchasePrice" DECIMAL(65,30),
    "closingDate" TIMESTAMP(3),
    "financingTerms" TEXT,
    "financingType" TEXT,
    "titleSettlementFee" DECIMAL(65,30),
    "titleExamination" DECIMAL(65,30),
    "ownersPolicyPremium" DECIMAL(65,30),
    "recordingFeesDeed" DECIMAL(65,30),
    "stateTaxStamps" DECIMAL(65,30),
    "eRecordingFee" DECIMAL(65,30),
    "realEstateCommission" DECIMAL(65,30),
    "sellerId" TEXT,
    "sellerAgentId" TEXT,
    "buyerAgentId" TEXT,
    "titleCompanyId" TEXT,
    "placeId" TEXT,
    "promotedToPropertyId" TEXT,
    "promotedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deal_promotedToPropertyId_key" ON "public"."Deal"("promotedToPropertyId");

-- CreateIndex
CREATE INDEX "Deal_userId_idx" ON "public"."Deal"("userId");

-- CreateIndex
CREATE INDEX "Deal_dealStage_idx" ON "public"."Deal"("dealStage");

-- CreateIndex
CREATE INDEX "Deal_dealStatus_idx" ON "public"."Deal"("dealStatus");

-- CreateIndex
CREATE INDEX "Deal_placeId_idx" ON "public"."Deal"("placeId");

-- CreateIndex
CREATE INDEX "Deal_sellerId_idx" ON "public"."Deal"("sellerId");

-- CreateIndex
CREATE INDEX "Deal_sellerAgentId_idx" ON "public"."Deal"("sellerAgentId");

-- CreateIndex
CREATE INDEX "Deal_buyerAgentId_idx" ON "public"."Deal"("buyerAgentId");

-- CreateIndex
CREATE INDEX "Deal_titleCompanyId_idx" ON "public"."Deal"("titleCompanyId");

-- CreateIndex
CREATE INDEX "Deal_promotedToPropertyId_idx" ON "public"."Deal"("promotedToPropertyId");

-- CreateIndex
CREATE UNIQUE INDEX "MillRateHistory_placeId_year_key" ON "public"."MillRateHistory"("placeId", "year");

-- CreateIndex
CREATE INDEX "Place_countyId_idx" ON "public"."Place"("countyId");

-- CreateIndex
CREATE INDEX "Place_statePlaceId_idx" ON "public"."Place"("statePlaceId");

-- AddForeignKey
ALTER TABLE "public"."Place" ADD CONSTRAINT "Place_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Place" ADD CONSTRAINT "Place_statePlaceId_fkey" FOREIGN KEY ("statePlaceId") REFERENCES "public"."Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_sellerAgentId_fkey" FOREIGN KEY ("sellerAgentId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_buyerAgentId_fkey" FOREIGN KEY ("buyerAgentId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_titleCompanyId_fkey" FOREIGN KEY ("titleCompanyId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "public"."Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Deal" ADD CONSTRAINT "Deal_promotedToPropertyId_fkey" FOREIGN KEY ("promotedToPropertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
