/*
  Warnings:

  - Added the required column `scheduleVersionReported` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "scheduleVersionReported" TEXT NOT NULL;
