/*
  Warnings:

  - Changed the type of `category` on the `Complaint` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Complaint" DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropEnum
DROP TYPE "ComplaintCategory";

-- CreateTable
CREATE TABLE "CategoryMaster" (
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,

    CONSTRAINT "CategoryMaster_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "SubcategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,

    CONSTRAINT "SubcategoryMaster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubcategoryMaster" ADD CONSTRAINT "SubcategoryMaster_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "CategoryMaster"("name") ON DELETE CASCADE ON UPDATE CASCADE;
