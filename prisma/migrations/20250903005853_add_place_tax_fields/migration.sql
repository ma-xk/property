-- AlterTable
ALTER TABLE "public"."Place" ADD COLUMN     "assessmentDay" INTEGER,
ADD COLUMN     "assessmentMonth" INTEGER,
ADD COLUMN     "lateInterestRate" DECIMAL(65,30),
ADD COLUMN     "taxDueDay" INTEGER,
ADD COLUMN     "taxDueMonth" INTEGER,
ADD COLUMN     "taxNotes" TEXT,
ADD COLUMN     "taxOfficePhone" TEXT,
ADD COLUMN     "taxPaymentAddress" TEXT,
ADD COLUMN     "taxPaymentWebsite" TEXT;
