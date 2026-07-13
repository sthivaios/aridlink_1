import { get_sha256 } from "@/lib/utils";
import prisma from "@/lib/prismacilent";
import { tryCatch } from "@/lib/try-catch";
import {
  DeviceKeyIncorrect,
  DeviceUnapproved,
  DeviceUnregisteredOrInvalid,
  MalformedAuthorizationHeader,
} from "@/lib/errors/authorization-errors";

async function break_basic_auth_header(header: string) {
  const [imei, key] = atob(header.slice(6)).split(":");
  return { imei, key };
}

/**
 * Authenticates a device using Basic authentication from request headers.
 * @param req - The incoming HTTP request containing authorization header
 * @returns The authenticated device object from the databathrow new DeviceAuthorizationError() if authentication fails.
 */
export async function authenticateDevice(req: Request) {
  // extract authorization header, and check if it uses basic authentication
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) throw new MalformedAuthorizationHeader();

  // decode authorization header and split into imei and key
  const { data, error } = await tryCatch(break_basic_auth_header(header));
  if (error) {
    throw new MalformedAuthorizationHeader();
  }

  // get key sha256
  const hashed_key: string = get_sha256(data.key);

  // get device with that imei from the db
  const device = await prisma.device.findUnique({ where: { imei: data.imei }, include: { scheduleProfile: {} } });

  if (!device) {
    // validation
    throw new DeviceUnregisteredOrInvalid();
  } else if (device.keySHA256 !== hashed_key) {
    throw new DeviceKeyIncorrect();
  } else if (!device.approved) {
    throw new DeviceUnapproved();
  }

  // return the device object from the db if authenticated
  return device;
}
