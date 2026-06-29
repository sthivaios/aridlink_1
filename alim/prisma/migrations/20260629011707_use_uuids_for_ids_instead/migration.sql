/*
  Warnings:

  - The primary key for the `Heartbeat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ValveEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Heartbeat" DROP CONSTRAINT "Heartbeat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Heartbeat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Heartbeat_id_seq";

-- AlterTable
ALTER TABLE "ValveEvent" DROP CONSTRAINT "ValveEvent_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ValveEvent_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ValveEvent_id_seq";
