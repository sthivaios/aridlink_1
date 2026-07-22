import { NextResponse } from "next/server";
import { authenticateDevice } from "@/lib/authenticate-device";
import { tryCatch } from "@/lib/try-catch";
import {
  AlimError,
  alimErrorResponse,
  UnhandledInternalServerException,
} from "@/lib/errors/errors";
import { compileScheduleJson } from "@/lib/compile-device-json";
import { parseValves } from "@/lib/parse-valves-json";
import { DeviceNoAssignedCSP } from "@/lib/errors/misc-errors";

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

  const { data: parsedValveJson, error: parseValveJson_Error } = await tryCatch(
    parseValves(data.scheduleProfile?.schedule)
  );

  if (parseValveJson_Error) {
    return alimErrorResponse(new DeviceNoAssignedCSP());
  }

  const { data: compiledScheduleJson, error: compileScheduleJson_Error } =
    await tryCatch(
      compileScheduleJson(parsedValveJson)
    );

  if (compileScheduleJson_Error) {
    return alimErrorResponse(new DeviceNoAssignedCSP());
  }

  // return the schedule and info about it
  return NextResponse.json({
    schedule_version: data.scheduleProfile?.version,
    schedule: compiledScheduleJson,
  });
}
