"use server";

import React from "react";
import { Panel } from "@/components/primitives";
import { tryCatch } from "@/lib/try-catch";
import prisma from "@/lib/prismacilent";
import ErrorCard from "@/components/error-card";
import { SchedulesTable } from "@/components/schedules-table";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

async function Page() {
  const { data, error } = await tryCatch(
    prisma.scheduleProfile.findMany({
      include: {
        devices: {},
      },
      orderBy: {
        name: "asc",
      },
    })
  );

  if (error || !data) {
    return (
      <ErrorCard title="Error fetching devices">
        <p className="wrap-anywhere">
          There was an error while attempt to fetch the devices from the
          database. Details: {error?.message}
        </p>
      </ErrorCard>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Link
        href="./schedules/new"
        className="flex flex-row items-center justify-center gap-2 bg-primary px-5 py-1.5 text-sm leading-none font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Create new CSP
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </Link>
      <Panel className="flex w-full flex-col items-center justify-center gap-10 p-10">
        <p className="relative px-20 pb-2 font-bold after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-muted-foreground/50 after:to-transparent">
          Common schedule profiles (CSPs) registered on this server
        </p>
        <SchedulesTable scheduleProfiles={data} />
      </Panel>
    </div>
  );
}

export default Page;
