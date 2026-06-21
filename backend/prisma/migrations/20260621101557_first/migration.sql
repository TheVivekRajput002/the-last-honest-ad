-- CreateEnum
CREATE TYPE "AdFormat" AS ENUM ('CARD', 'RECEIPT');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmissionFactor" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "material" TEXT,
    "co2eKg" DOUBLE PRECISION NOT NULL,
    "waterLiters" DOUBLE PRECISION NOT NULL,
    "wasteKg" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmissionFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedAd" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "originalCopy" TEXT NOT NULL,
    "honestCopy" TEXT NOT NULL,
    "co2eKg" DOUBLE PRECISION NOT NULL,
    "waterLiters" DOUBLE PRECISION NOT NULL,
    "wasteKg" DOUBLE PRECISION NOT NULL,
    "sourceCitation" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "format" "AdFormat" NOT NULL DEFAULT 'CARD',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedAd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPost" (
    "id" TEXT NOT NULL,
    "generatedAdId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "handle" TEXT,
    "totalFootprintSaved" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "scansCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPost_generatedAdId_key" ON "GalleryPost"("generatedAdId");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- AddForeignKey
ALTER TABLE "EmissionFactor" ADD CONSTRAINT "EmissionFactor_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAd" ADD CONSTRAINT "GeneratedAd_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAd" ADD CONSTRAINT "GeneratedAd_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPost" ADD CONSTRAINT "GalleryPost_generatedAdId_fkey" FOREIGN KEY ("generatedAdId") REFERENCES "GeneratedAd"("id") ON DELETE CASCADE ON UPDATE CASCADE;
