-- CreateEnum
CREATE TYPE "ResolutionType" AS ENUM ('EMPLOYEE_NOTE', 'ADMIN_RESOLUTION', 'ADMIN_TO_EMPLOYEE', 'REJECTION', 'REOPEN_NOTE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ComplaintStatus" ADD VALUE 'OPEN';
ALTER TYPE "ComplaintStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "Complaint" ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "ComplaintResolution" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "ResolutionType" NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintResolution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintResolution_complaintId_idx" ON "ComplaintResolution"("complaintId");

-- AddForeignKey
ALTER TABLE "ComplaintResolution" ADD CONSTRAINT "ComplaintResolution_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintResolution" ADD CONSTRAINT "ComplaintResolution_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
