/*
  Warnings:

  - A unique constraint covering the columns `[ticketNumber]` on the table `Complaint` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "ticketNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_ticketNumber_key" ON "Complaint"("ticketNumber");
