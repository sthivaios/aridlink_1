// lib/db-health.ts
import prisma from "@/lib/prismacilent";

const TTL_HEALTHY = 5_000;
const TTL_DOWN = 1_000;
const PROBE_TIMEOUT = 2_000;

let lastProbe = 0;
let healthy = true;

export async function isDatabaseHealthy(): Promise<boolean> {
  const now = Date.now();
  if (now - lastProbe < (healthy ? TTL_HEALTHY : TTL_DOWN)) return healthy;
  lastProbe = now;

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("probe timeout")), PROBE_TIMEOUT)
      ),
    ]);
    healthy = true;
  } catch (error) {
    console.error("DB health probe failed:", error);
    healthy = false;
  }
  return healthy;
}
