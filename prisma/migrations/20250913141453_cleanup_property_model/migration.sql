/*
  Warnings:

  - You are about to drop the column `buyerAgent` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `buyerAgentId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `closingDate` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `eRecordingFee` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `earnestMoney` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `financingTerms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `financingType` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `ownersPolicyPremium` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `realEstateCommission` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `recordingFeesDeed` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `seller` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `sellerAgent` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `sellerAgentId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `stateTaxStamps` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `titleCompany` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `titleCompanyId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `titleExamination` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `titleSettlementFee` on the `Property` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Property" DROP CONSTRAINT "Property_buyerAgentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Property" DROP CONSTRAINT "Property_sellerAgentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Property" DROP CONSTRAINT "Property_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Property" DROP CONSTRAINT "Property_titleCompanyId_fkey";

-- DropIndex
DROP INDEX "public"."Property_buyerAgentId_idx";

-- DropIndex
DROP INDEX "public"."Property_sellerAgentId_idx";

-- DropIndex
DROP INDEX "public"."Property_sellerId_idx";

-- DropIndex
DROP INDEX "public"."Property_titleCompanyId_idx";

-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "buyerAgent",
DROP COLUMN "buyerAgentId",
DROP COLUMN "closingDate",
DROP COLUMN "eRecordingFee",
DROP COLUMN "earnestMoney",
DROP COLUMN "financingTerms",
DROP COLUMN "financingType",
DROP COLUMN "ownersPolicyPremium",
DROP COLUMN "purchasePrice",
DROP COLUMN "realEstateCommission",
DROP COLUMN "recordingFeesDeed",
DROP COLUMN "seller",
DROP COLUMN "sellerAgent",
DROP COLUMN "sellerAgentId",
DROP COLUMN "sellerId",
DROP COLUMN "stateTaxStamps",
DROP COLUMN "titleCompany",
DROP COLUMN "titleCompanyId",
DROP COLUMN "titleExamination",
DROP COLUMN "titleSettlementFee";
