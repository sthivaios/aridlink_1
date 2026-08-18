"use server";

import prisma from "@/lib/prismacilent";
import { generate_device_key, get_sha256 } from "@/lib/utils";

export async function createDevice(
  imei: string,
  name: string,
  locationDescription: string,
  CSP_ID?: string
) {
  const deviceKey: string = generate_device_key();

  const prisma_response = await prisma.device.create({
    data: {
      imei: imei,
      name: name,
      locationDescription: locationDescription,
      keySHA256: get_sha256(deviceKey),
      scheduleProfileId: CSP_ID
    }
  });

  return {
    prisma_return: prisma_response,
    deviceKey
  }
}
