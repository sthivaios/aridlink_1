"use server";

import prisma from "@/lib/prismacilent";

export async function editDevice(
  imei: string,
  updatedData: {
    name?: string;
    locationDescription?: string;
    CSP_ID?: string;
  }
) {
  return await prisma.device.update({
    where: {
      imei: imei,
    },
    data: {
      imei: imei,
      name: updatedData.name,
      locationDescription: updatedData.locationDescription,
      scheduleProfileId: updatedData.CSP_ID,
    },
  });
}
