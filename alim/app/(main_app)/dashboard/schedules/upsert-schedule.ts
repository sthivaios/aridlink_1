"use server";

import prisma from "@/lib/prismacilent";
import { Valves } from "@/lib/types";
import { v7 as uuidv7promax } from "uuid";

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
      version: uuidv7promax()
    },
    where: {
      id: id ?? "",
    },
  });
}

export async function scheduleDelete(id: string) {
  return prisma.scheduleProfile.delete({
    where: {
      id: id,
    }
  })
}