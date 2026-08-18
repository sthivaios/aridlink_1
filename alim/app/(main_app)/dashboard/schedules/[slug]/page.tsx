import React from "react";
import { UpsertScheduleForm } from "@/app/(main_app)/dashboard/schedules/upsertScheduleForm";
import prisma from "@/lib/prismacilent";
import { tryCatch } from "@/lib/try-catch";
import ErrorCard from "@/components/error-card";
import { parseValves } from "@/lib/parse-valves-json";

async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data, error } = await tryCatch(
    prisma.scheduleProfile.findUnique({
      where: {
        id: slug,
      },
      include: {
        devices: {},
      },
    })
  );

  if (error || data == null) {
    return (
      <ErrorCard title="Schedule not found">
        <p>The requested CSP could not be found.</p>
      </ErrorCard>
    );
  }

  return (
    <div>
      <UpsertScheduleForm
        valves={await parseValves(data.schedule)}
        fullCspObject={data}
      />
    </div>
  );
}

export default Page;
