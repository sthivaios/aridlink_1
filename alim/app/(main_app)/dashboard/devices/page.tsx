"use server";

import React from "react";
import { Panel } from "@/components/primitives";
import { tryCatch } from "@/lib/try-catch";
import prisma from "@/lib/prismacilent";
import ErrorCard from "@/components/error-card";
import { ArrowRight, Info } from "lucide-react";
import { DeviceTable } from "@/components/device-table";
import Link from "next/link";

export async function Page() {
  const { data, error } = await tryCatch(
    prisma.device.findMany({
      include: {
        heartbeats: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })
  );

  if (error) {
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
        href="./devices/new"
        className="flex flex-row items-center justify-center gap-2 bg-primary px-5 py-1.5 text-sm leading-none font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Register new device
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </Link>
      <div className="flex w-full flex-col items-center gap-5">
        {data.filter((d) => d.approved).length > 0 ? (
          <Panel className="flex w-full flex-col items-center justify-center gap-10 p-10">
            <p className="relative px-20 pb-2 font-bold after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-muted-foreground/50 after:to-transparent">
              Devices registered to this server
            </p>
            <DeviceTable devices={data.filter((d) => d.approved)} />
          </Panel>
        ) : (
          <div className="flex flex-row items-center gap-2">
            <Info className="h-4 w-4 stroke-muted-foreground" />
            <p className="text-muted-foreground italic">
              There are no devices registered on this server
            </p>
          </div>
        )}
        {data.filter((d) => !d.approved).length > 0 ? (
          <Panel className="flex w-full flex-col items-center justify-center gap-10 p-10">
            <p className="relative px-20 pb-2 font-bold after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-muted-foreground/50 after:to-transparent">
              Devices pending approval to be registered on this server
            </p>
            <DeviceTable devices={data.filter((d) => !d.approved)} />
          </Panel>
        ) : (
          <div className="flex flex-row items-center gap-2">
            <Info className="h-4 w-4 stroke-muted-foreground" />
            <p className="text-muted-foreground italic">
              There are no devices pending approval into ALIM
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
