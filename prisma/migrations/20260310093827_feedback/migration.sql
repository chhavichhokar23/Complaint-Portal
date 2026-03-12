-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "feedbackAt" TIMESTAMP(3),
ADD COLUMN     "feedbackComment" TEXT,
ADD COLUMN     "feedbackRating" INTEGER;
