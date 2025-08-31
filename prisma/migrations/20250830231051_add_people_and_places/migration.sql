-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "buyerAgentId" TEXT,
ADD COLUMN     "placeId" TEXT,
ADD COLUMN     "sellerAgentId" TEXT,
ADD COLUMN     "sellerId" TEXT,
ADD COLUMN     "titleCompanyId" TEXT;

-- CreateTable
CREATE TABLE "public"."Place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'United States',
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "role" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Place_userId_idx" ON "public"."Place"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Place_name_state_userId_key" ON "public"."Place"("name", "state", "userId");

-- CreateIndex
CREATE INDEX "Person_userId_idx" ON "public"."Person"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_name_userId_key" ON "public"."Person"("name", "userId");

-- CreateIndex
CREATE INDEX "Property_placeId_idx" ON "public"."Property"("placeId");

-- CreateIndex
CREATE INDEX "Property_sellerId_idx" ON "public"."Property"("sellerId");

-- CreateIndex
CREATE INDEX "Property_sellerAgentId_idx" ON "public"."Property"("sellerAgentId");

-- CreateIndex
CREATE INDEX "Property_buyerAgentId_idx" ON "public"."Property"("buyerAgentId");

-- CreateIndex
CREATE INDEX "Property_titleCompanyId_idx" ON "public"."Property"("titleCompanyId");

-- AddForeignKey
ALTER TABLE "public"."Place" ADD CONSTRAINT "Place_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Person" ADD CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_sellerAgentId_fkey" FOREIGN KEY ("sellerAgentId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_buyerAgentId_fkey" FOREIGN KEY ("buyerAgentId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_titleCompanyId_fkey" FOREIGN KEY ("titleCompanyId") REFERENCES "public"."Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "public"."Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
