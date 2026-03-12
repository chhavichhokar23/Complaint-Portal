/*
  Warnings:

  - The `status` column on the `Complaint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `department` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Department" AS ENUM ('TECHNICAL', 'FINANCE', 'SUPPORT');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('TECHNICAL', 'BILLING', 'ACCOUNT', 'GENERAL');

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "category" "ComplaintCategory" NOT NULL DEFAULT 'GENERAL',
DROP COLUMN "status",
ADD COLUMN     "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
ADD COLUMN     "department" "Department";
