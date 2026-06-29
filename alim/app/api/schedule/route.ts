import { NextResponse } from "next/server";
import { authenticateDevice } from "@/lib/authenticate-device";
import { tryCatch } from "@/lib/try-catch";
import { AlimError, internal_server_error_response } from "@/lib/errors/errors";

export async function GET(request: Request) {
  const { data, error } = await tryCatch(authenticateDevice(request));

  // check if the device authentication errored
  if (error) {
    // check if the error is an ALIM error class
    if (error instanceof AlimError) {
      // return it if it is
      return NextResponse.json({
        error_code: error.code,
        error_message: error.message
      }, { status: error.http_code })
    } else {
      // return the internal unhandled error response if its not an alim error
      return internal_server_error_response;
    }
  }

  if (!data) {
    // return the internal unhandled error response if the data is somehow null
    return internal_server_error_response;
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
