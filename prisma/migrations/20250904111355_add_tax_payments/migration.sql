-- AlterTable
ALTER TABLE "public"."Place" ADD COLUMN     "millRate" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "assessedValue" DECIMAL(65,30),
ADD COLUMN     "assessmentNotes" TEXT,
ADD COLUMN     "lastAssessmentDate" TIMESTAMP(3),
ADD COLUMN     "marketValue" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "public"."TaxPayment" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaxPayment_propertyId_idx" ON "public"."TaxPayment"("propertyId");

-- CreateIndex
CREATE INDEX "TaxPayment_userId_idx" ON "public"."TaxPayment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxPayment_propertyId_year_key" ON "public"."TaxPayment"("propertyId", "year");

-- AddForeignKey
ALTER TABLE "public"."TaxPayment" ADD CONSTRAINT "TaxPayment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaxPayment" ADD CONSTRAINT "TaxPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
