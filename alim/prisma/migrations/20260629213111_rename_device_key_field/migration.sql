/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `Device` table. All the data in the column will be lost.
  - Added the required column `keySHA256` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "tokenHash",
ADD COLUMN     "keySHA256" TEXT NOT NULL;
