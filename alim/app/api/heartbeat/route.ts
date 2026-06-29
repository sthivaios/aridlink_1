import { NextResponse } from "next/server"
import { tryCatch } from "@/lib/try-catch"
import prisma from "@/lib/prismacilent"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client"

export async function POST(request: Request) {
  const { imei, rssi, ber, valveOpen, batteryVoltage, cabinetTemperature } = await request.json();
  console.log(imei)

  if (!imei) {
    return NextResponse.json({ error: "Missing IMEI from body! ALIM needs to know which device to post a heartbeat for." }, { status: 400 })
  }

  const {data, error} = await tryCatch(
    prisma.heartbeat.create({
      data: {
        imei,
        rssi,
        ber,
        valveOpen,
        batteryVoltage,
        cabinetTemperature
      }
    })
  );

  if (error || data == null) {
    console.error(error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code == "P2003") {
        return NextResponse.json(
          {
            error: "A device with the provided IMEI does not exist on the ALIM database. Go through device onboarding before posting a heartbeat. Refer to the documentation.",
          },
          { status: 404 }
        )
      }
    }
    return NextResponse.json(
      {
        error:
          "The heartbeat could not be registered.",
      },
      { status: 404 }
    )
  }

  return NextResponse.json(data, {status: 200});
}