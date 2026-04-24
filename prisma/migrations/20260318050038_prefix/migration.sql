/*
  Warnings:

  - A unique constraint covering the columns `[prefix]` on the table `CategoryMaster` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CategoryMaster" ADD COLUMN     "prefix" TEXT;

-- AlterTable
ALTER TABLE "Complaint" ALTER COLUMN "ticketNumber" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMaster_prefix_key" ON "CategoryMaster"("prefix");
