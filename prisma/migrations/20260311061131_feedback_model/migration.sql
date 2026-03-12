/*
  Warnings:

  - You are about to drop the column `feedbackAt` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackComment` on the `Complaint` table. All the data in the column will be lost.
  - You are about to drop the column `feedbackRating` on the `Complaint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "feedbackAt",
DROP COLUMN "feedbackComment",
DROP COLUMN "feedbackRating";

-- CreateTable
CREATE TABLE "ComplaintFeedback" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintFeedback_complaintId_idx" ON "ComplaintFeedback"("complaintId");

-- AddForeignKey
ALTER TABLE "ComplaintFeedback" ADD CONSTRAINT "ComplaintFeedback_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
