/*
  Warnings:

  - You are about to drop the column `deviceId` on the `Heartbeat` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `ValveEvent` table. All the data in the column will be lost.
  - Added the required column `imei` to the `Heartbeat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imei` to the `ValveEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Heartbeat" DROP CONSTRAINT "Heartbeat_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "ValveEvent" DROP CONSTRAINT "ValveEvent_deviceId_fkey";

-- DropIndex
DROP INDEX "Heartbeat_deviceId_createdAt_idx";

-- DropIndex
DROP INDEX "ValveEvent_deviceId_openedAt_idx";

-- AlterTable
ALTER TABLE "Heartbeat" DROP COLUMN "deviceId",
ADD COLUMN     "imei" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ValveEvent" DROP COLUMN "deviceId",
ADD COLUMN     "imei" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Heartbeat_imei_createdAt_idx" ON "Heartbeat"("imei", "createdAt");

-- CreateIndex
CREATE INDEX "ValveEvent_imei_openedAt_idx" ON "ValveEvent"("imei", "openedAt");

-- AddForeignKey
ALTER TABLE "Heartbeat" ADD CONSTRAINT "Heartbeat_imei_fkey" FOREIGN KEY ("imei") REFERENCES "Device"("imei") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValveEvent" ADD CONSTRAINT "ValveEvent_imei_fkey" FOREIGN KEY ("imei") REFERENCES "Device"("imei") ON DELETE CASCADE ON UPDATE CASCADE;
