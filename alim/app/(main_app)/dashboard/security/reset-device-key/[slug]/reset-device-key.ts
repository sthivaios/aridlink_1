"use server";

import { generate_device_key, get_sha256 } from "@/lib/utils";
import prisma from "@/lib/prismacilent";

export async function resetDeviceKey(imei: string) {
  const deviceKey: string = generate_device_key();

  const prisma_response = await prisma.device.update({
    where: {
      imei: imei,
    },
    data: {
      keySHA256: get_sha256(deviceKey),
    },
  });

  return {
    prisma_return: prisma_response,
    deviceKey,
  };
}
