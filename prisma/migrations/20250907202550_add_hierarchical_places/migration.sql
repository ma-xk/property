/*
  Warnings:

  - A unique constraint covering the columns `[placeId,year,scope]` on the table `MillRateHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,kind,parentId,userId]` on the table `Place` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scope` to the `MillRateHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PlaceKind" AS ENUM ('STATE', 'COUNTY', 'TOWN', 'UT');

-- CreateEnum
CREATE TYPE "public"."MillRateScope" AS ENUM ('MUNICIPAL', 'UT_COUNTY');

-- DropIndex
DROP INDEX "public"."MillRateHistory_placeId_year_key";

-- DropIndex
DROP INDEX "public"."Place_name_state_userId_key";

-- AlterTable
ALTER TABLE "public"."MillRateHistory" ADD COLUMN     "scope" "public"."MillRateScope" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Place" ADD COLUMN     "county" TEXT,
ADD COLUMN     "kind" "public"."PlaceKind" NOT NULL,
ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "mailingCity" TEXT;

-- CreateIndex
CREATE INDEX "MillRateHistory_scope_idx" ON "public"."MillRateHistory"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "MillRateHistory_placeId_year_scope_key" ON "public"."MillRateHistory"("placeId", "year", "scope");

-- CreateIndex
CREATE INDEX "Place_parentId_idx" ON "public"."Place"("parentId");

-- CreateIndex
CREATE INDEX "Place_kind_idx" ON "public"."Place"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "Place_name_kind_parentId_userId_key" ON "public"."Place"("name", "kind", "parentId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Place" ADD CONSTRAINT "Place_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
