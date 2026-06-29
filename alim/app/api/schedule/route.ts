import { NextResponse } from "next/server"
import { tryCatch } from "@/lib/try-catch"
import prisma from "@/lib/prismacilent"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imei = searchParams.get("imei")

  if (!imei) {
    return NextResponse.json({ error: "Missing IMEI parameter! ALIM needs to know which schedule to fetch." }, { status: 400 })
  }

  const {data, error} = await tryCatch(
    prisma.device.findUnique({
      where: {
        imei: imei,
      },
    })
  );

  if (error || data == null) {
    return NextResponse.json(
      {
        error:
          "The device does not exist on the ALIM database, or the IMEI is incorrect.",
      },
      { status: 404 }
    )
  }

  return NextResponse.json(data.schedule);
}