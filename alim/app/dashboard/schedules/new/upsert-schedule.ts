"use server";

import prisma from "@/lib/prismacilent";
import { Valves } from "@/lib/types";

export async function scheduleUpsert(
  name: string,
  description: string,
  valves: Valves,
  id?: string
) {
  return prisma.scheduleProfile.upsert({
    create: {
      name,
      description,
      schedule: valves,
    },
    update: {
      name,
      description,
      schedule: valves,
    },
    where: {
      id,
    },
  });
}
