import { get_sha256 } from "@/lib/utils";
import prisma from "@/lib/prismacilent";


/**
 * Authenticates a device using Basic authentication from request headers.
 * @param req - The incoming HTTP request containing authorization header
 * @returns The authenticated device object from the database, or null if authentication fails.
 */
export async function authenticateDevice(req: Request) {
  // extract authorization header, and check if it uses basic authentication
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;

  // decode authorization header and split into imei and key
  const [imei, key] = atob(header.slice(6)).split(":");

  // get key sha256
  const hashed_key: string = get_sha256(key);

  // get device with that imei from the db
  const device = await prisma.device.findUnique({ where: { imei } });

  // validation
  if (!device) {
    // TODO: Log unregistered or invalid device
    return null;
  } else if (device.keySHA256 !== hashed_key) {
    // TODO: Log wrong device key
    return null;
  } else if (!device.approved) {
    // TODO: Log device unapproved
    return null;
  }

  // return the device object from the db if authenticated
  return device;
}
