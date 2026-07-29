import React from "react";
import prisma from "@/lib/prismacilent";
import { tryCatch } from "@/lib/try-catch";
import ErrorCard from "@/components/error-card";
import EditDeviceForm from "@/app/dashboard/devices/[slug]/editDeviceForm";

async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data, error } = await tryCatch(
    prisma.device.findUnique({
      where: {
        imei: slug
      }
    })
  );

  if (error || (data == null)) {
    return (
      <ErrorCard title="Schedule not found">
        <p>The requested CSP could not be found.</p>
      </ErrorCard>
    )
  }

  const { data: CSPs, error: ErrorFetchingCSPs } = await tryCatch(
    prisma.scheduleProfile.findMany({})
  );

  return (
    <div>
      <EditDeviceForm CSPs={CSPs} CSPs_Error={!!ErrorFetchingCSPs} device={data} />
    </div>
  );
}

export default Page;
