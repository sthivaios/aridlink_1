/*
  Warnings:

  - You are about to drop the column `schedule` on the `Device` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleVersion` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "schedule",
DROP COLUMN "scheduleVersion",
ADD COLUMN     "scheduleProfileId" TEXT,
ALTER COLUMN "scheduleVersionReported" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ScheduleProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_scheduleProfileId_fkey" FOREIGN KEY ("scheduleProfileId") REFERENCES "ScheduleProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
