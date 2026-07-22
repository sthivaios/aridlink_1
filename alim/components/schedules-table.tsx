import React from "react";
import { Device, ScheduleProfile } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";
import { OpenEntityBadge } from "@/components/open-entity-badge";

type ScheduleProfilesWithDevicesUsingIt = ScheduleProfile & { devices: Device[] };

export async function SchedulesTable(props: {
  scheduleProfiles: ScheduleProfilesWithDevicesUsingIt[];
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead className="">
        <tr className="border-b border-border text-left text-[12px] tracking-widest text-muted-foreground uppercase [&>th]:pb-3">
          <th className="pl-4 font-medium">Name</th>
          <th className="hidden font-medium md:table-cell">Description</th>
          <th className="hidden font-medium md:table-cell">Created At</th>
          <th className="font-medium">Updated At</th>
          <th className="hidden font-medium sm:table-cell">
            Devices using CSP
          </th>
          <th className="">Actions</th>
        </tr>
      </thead>
      <tbody>
        {props.scheduleProfiles.map((scheduleProfile) => {
          return (
            <tr
              key={scheduleProfile.id}
              className="group h-10 items-center justify-center border-b border-border/70 transition-colors hover:bg-accent/40"
            >
              {/* name */}
              <td className="pl-4">
                <span className="text-xs font-semibold text-foreground">
                  {scheduleProfile.name}
                </span>
              </td>

              {/* description */}
              <td className="">
                <span className={cn("tnum text-xs")}>
                  {scheduleProfile.description}
                </span>
              </td>

              {/* created at */}
              <td className="">
                <span className={cn("tnum text-xs")}>
                  {scheduleProfile
                    ? new Date(scheduleProfile.createdAt).toLocaleString()
                    : "-"}
                </span>
              </td>

              {/* updated at */}
              <td className="">
                <span className="tnum text-xs text-muted-foreground">
                  {scheduleProfile
                    ? new Date(scheduleProfile.updatedAt).toLocaleString()
                    : "-"}
                </span>
              </td>

              {/* used by devices */}
              <td className="">
                <span className="tnum text-xs text-muted-foreground">
                  {scheduleProfile.devices.length}
                </span>
              </td>

              {/* open schedule */}
              <td className="">
                <OpenEntityBadge
                  href={`./schedules/${scheduleProfile.id}`}
                  title="View CSP"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
