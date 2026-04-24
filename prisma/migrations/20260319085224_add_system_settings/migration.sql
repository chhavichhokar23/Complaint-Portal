-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'system',
    "defaultSlaHours" INTEGER NOT NULL DEFAULT 72,
    "defaultPriorityId" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_defaultPriorityId_fkey" FOREIGN KEY ("defaultPriorityId") REFERENCES "PriorityMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
