-- CreateEnum
CREATE TYPE "TaxIdType" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "CommandExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "RuralProducer" (
    "id" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "taxIdType" "TaxIdType" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RuralProducer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "ruralProducerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "totalAreaHectares" DOUBLE PRECISION NOT NULL,
    "arableAreaHectares" DOUBLE PRECISION NOT NULL,
    "vegetationAreaHectares" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestSeason" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "HarvestSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planting" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "harvestSeasonId" TEXT NOT NULL,

    CONSTRAINT "Planting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "roles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandExecution" (
    "id" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "correlationId" TEXT,
    "status" "CommandExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CommandExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RuralProducer_taxId_key" ON "RuralProducer"("taxId");

-- CreateIndex
CREATE INDEX "Farm_ruralProducerId_idx" ON "Farm"("ruralProducerId");

-- CreateIndex
CREATE UNIQUE INDEX "HarvestSeason_year_key" ON "HarvestSeason"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_name_key" ON "Crop"("name");

-- CreateIndex
CREATE INDEX "Planting_farmId_harvestSeasonId_idx" ON "Planting"("farmId", "harvestSeasonId");

-- CreateIndex
CREATE INDEX "Planting_cropId_harvestSeasonId_idx" ON "Planting"("cropId", "harvestSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Planting_farmId_cropId_harvestSeasonId_key" ON "Planting"("farmId", "cropId", "harvestSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "CommandExecution_status_idx" ON "CommandExecution"("status");

-- CreateIndex
CREATE INDEX "CommandExecution_correlationId_idx" ON "CommandExecution"("correlationId");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ruralProducerId_fkey" FOREIGN KEY ("ruralProducerId") REFERENCES "RuralProducer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planting" ADD CONSTRAINT "Planting_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planting" ADD CONSTRAINT "Planting_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Planting" ADD CONSTRAINT "Planting_harvestSeasonId_fkey" FOREIGN KEY ("harvestSeasonId") REFERENCES "HarvestSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
