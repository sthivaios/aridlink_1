import React from "react";
import prisma from "@/lib/prismacilent";
import { tryCatch } from "@/lib/try-catch";
import ErrorCard from "@/components/error-card";
import ResetDeviceKeyForm from "@/app/(main_app)/dashboard/security/reset-device-key/[slug]/resetDeviceKeyForm";

async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data, error } = await tryCatch(
    prisma.device.findUnique({
      where: {
        imei: slug,
      },
      include: {
        scheduleProfile: {},
      },
    })
  );

  if (error || data == null) {
    return (
      <ErrorCard title="Device not found">
        <p>The requested device could not be found.</p>
      </ErrorCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ResetDeviceKeyForm device={data} />
    </div>
  );
}

export default Page;
