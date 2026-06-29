import { get_sha256 } from "@/lib/utils";
import prisma from "@/lib/prismacilent";

export async function authenticateDevice(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;

  const [imei, key] = atob(header.slice(6)).split(":");

  const hashed_key: string = get_sha256(key);

  const device = await prisma.device.findUnique({ where: { imei } });
  if (!device || device.keySHA256 !== hashed_key || !device.approved) return null;

  return device;
}
