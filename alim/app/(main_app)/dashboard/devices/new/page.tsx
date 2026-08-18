import React from "react";
import NewDeviceForm from "@/app/(main_app)/dashboard/devices/new/newDeviceForm";
import { tryCatch } from "@/lib/try-catch";
import prisma from "@/lib/prismacilent";

async function Page() {
  const { data: CSPs, error: ErrorFetchingCSPs } = await tryCatch(
    prisma.scheduleProfile.findMany({})
  );

  return (
    <div>
      <NewDeviceForm CSPs={CSPs} CSPs_Error={!!ErrorFetchingCSPs} />
    </div>
  );
}

export default Page;
