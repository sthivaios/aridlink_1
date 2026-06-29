import { NextResponse } from "next/server"
import { tryCatch } from "@/lib/try-catch"
import prisma from "@/lib/prismacilent"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"
import { authenticateDevice } from "@/lib/authenticate-device";
import {
  AlimError,
  alimErrorResponse,
  UnhandledInternalServerException,
} from "@/lib/errors/errors";
import { HeartbeatDeviceUnregisteredOrInvalid, HeartbeatLoggingError } from "@/lib/errors/heartbeat-errors";

export async function POST(request: Request) {
  const { rssi, ber, valveOpen, batteryVoltage, cabinetTemperature } = await request.json();

  const { data: authenticationData, error: authenticationError } = await tryCatch(authenticateDevice(request));

  // check if the device authentication errored
  if (authenticationError) {
    // check if the error is an ALIM error class
    if (authenticationError instanceof AlimError) {
      // return it if it is
      return alimErrorResponse(authenticationError);
    } else {
      // return the internal unhandled error response if its not an alim error
      return alimErrorResponse(new UnhandledInternalServerException());
    }
  }

  if (!authenticationData) {
    // return the internal unhandled error response if the data is somehow null
    return alimErrorResponse(new UnhandledInternalServerException());
  }

  const {data, error} = await tryCatch(
    prisma.heartbeat.create({
      data: {
        imei: authenticationData.imei,
        rssi,
        ber,
        valveOpen,
        batteryVoltage,
        cabinetTemperature
      }
    })
  );

  if (
    error instanceof PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    return alimErrorResponse(new HeartbeatDeviceUnregisteredOrInvalid());
  }

  if (error || data == null) {
    return alimErrorResponse(new HeartbeatLoggingError());
  }

  return NextResponse.json(data, {status: 200});
}