import { NextResponse } from "next/server";
import { authenticateDevice } from "@/lib/authenticate-device";
import { tryCatch } from "@/lib/try-catch";
import {
  AlimError,
  alimErrorResponse,
  UnhandledInternalServerException,
} from "@/lib/errors/errors";

export async function GET(request: Request) {
  const { data, error } = await tryCatch(authenticateDevice(request));

  // check if the device authentication errored
  if (error) {
    // check if the error is an ALIM error class
    if (error instanceof AlimError) {
      // return it if it is
      return alimErrorResponse(error);
    } else {
      // return the internal unhandled error response if its not an alim error
      return alimErrorResponse(new UnhandledInternalServerException());
    }
  }

  if (!data) {
    // return the internal unhandled error response if the data is somehow null
    return alimErrorResponse(new UnhandledInternalServerException());
  }

  // return the schedule and info about it
  return NextResponse.json({
    device: {
      device_imei: data.imei,
      device_name: data.name,
      schedule_updated: data.scheduleLastUpdated
    },
    schedule: data.schedule
  });
}
