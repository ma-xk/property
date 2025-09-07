-- CreateTable
CREATE TABLE "public"."MillRateHistory" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "millRate" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MillRateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyValuationHistory" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "assessedValue" DECIMAL(65,30),
    "marketValue" DECIMAL(65,30),
    "assessmentDate" TIMESTAMP(3),
    "assessmentNotes" TEXT,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyValuationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MillRateHistory_placeId_idx" ON "public"."MillRateHistory"("placeId");

-- CreateIndex
CREATE INDEX "MillRateHistory_userId_idx" ON "public"."MillRateHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MillRateHistory_placeId_year_key" ON "public"."MillRateHistory"("placeId", "year");

-- CreateIndex
CREATE INDEX "PropertyValuationHistory_propertyId_idx" ON "public"."PropertyValuationHistory"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyValuationHistory_userId_idx" ON "public"."PropertyValuationHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyValuationHistory_propertyId_year_key" ON "public"."PropertyValuationHistory"("propertyId", "year");

-- AddForeignKey
ALTER TABLE "public"."MillRateHistory" ADD CONSTRAINT "MillRateHistory_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "public"."Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MillRateHistory" ADD CONSTRAINT "MillRateHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyValuationHistory" ADD CONSTRAINT "PropertyValuationHistory_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyValuationHistory" ADD CONSTRAINT "PropertyValuationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
