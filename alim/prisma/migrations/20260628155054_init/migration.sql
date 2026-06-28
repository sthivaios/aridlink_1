-- CreateTable
CREATE TABLE "Device" (
    "imei" TEXT NOT NULL,
    "name" TEXT,
    "tokenHash" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "firstSeen" TIMESTAMP(3),
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("imei")
);

-- CreateTable
CREATE TABLE "Heartbeat" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "rssi" INTEGER,
    "ber" INTEGER,
    "valveOpen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Heartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValveEvent" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "ValveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Heartbeat_deviceId_createdAt_idx" ON "Heartbeat"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "ValveEvent_deviceId_openedAt_idx" ON "ValveEvent"("deviceId", "openedAt");

-- CreateIndex
CREATE INDEX "ApiKey_keyPrefix_idx" ON "ApiKey"("keyPrefix");

-- AddForeignKey
ALTER TABLE "Heartbeat" ADD CONSTRAINT "Heartbeat_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("imei") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValveEvent" ADD CONSTRAINT "ValveEvent_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("imei") ON DELETE CASCADE ON UPDATE CASCADE;
