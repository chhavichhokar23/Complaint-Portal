/*
  Warnings:

  - The primary key for the `DepartmentMaster` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `department` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `name` on the `DepartmentMaster` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DepartmentMaster" DROP CONSTRAINT "DepartmentMaster_pkey",
DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "DepartmentMaster_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
ADD COLUMN     "department" TEXT;

-- DropEnum
DROP TYPE "Department";
