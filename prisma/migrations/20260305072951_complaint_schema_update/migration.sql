/*
  Warnings:

  - You are about to drop the column `title` on the `Complaint` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ComplaintStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "ComplaintStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "title",
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "resolutionMessage" TEXT,
ADD COLUMN     "slaDeadline" TIMESTAMP(3),
ADD COLUMN     "subcategory" TEXT;
