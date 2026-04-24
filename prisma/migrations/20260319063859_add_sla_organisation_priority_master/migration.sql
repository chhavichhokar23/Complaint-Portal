/*
  Warnings:

  - You are about to drop the column `priority` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `organisation` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "priority",
ADD COLUMN     "priorityId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organisation",
ADD COLUMN     "organisationId" TEXT;

-- DropEnum
DROP TYPE "Priority";

-- CreateTable
CREATE TABLE "PriorityMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PriorityMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultPriorityId" TEXT,

    CONSTRAINT "OrganisationMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaMaster" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "priorityId" TEXT NOT NULL,
    "timeline" INTEGER NOT NULL,

    CONSTRAINT "SlaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriorityMaster_name_key" ON "PriorityMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationMaster_name_key" ON "OrganisationMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SlaMaster_organisationId_priorityId_key" ON "SlaMaster"("organisationId", "priorityId");

-- AddForeignKey
ALTER TABLE "OrganisationMaster" ADD CONSTRAINT "OrganisationMaster_defaultPriorityId_fkey" FOREIGN KEY ("defaultPriorityId") REFERENCES "PriorityMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaMaster" ADD CONSTRAINT "SlaMaster_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "OrganisationMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaMaster" ADD CONSTRAINT "SlaMaster_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "PriorityMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "OrganisationMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "PriorityMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
