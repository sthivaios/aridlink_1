import Link from "next/link";
import { cn } from "@/lib/utils";
import { Device, Heartbeat } from "@/lib/generated/prisma/client";
import { SyncBadge } from "@/components/sync-badge";
import React from "react";
import { OpenEntityBadge } from "@/components/open-entity-badge";

type DeviceWithLatestHeartbeat = Device & { heartbeats: Heartbeat[] };

export function DeviceTable(props: { devices: DeviceWithLatestHeartbeat[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead className="">
        <tr className="border-b border-border text-left text-[12px] tracking-widest text-muted-foreground uppercase [&>th]:pb-3">
          <th className="pl-4 font-medium">Device</th>
          <th className="hidden font-medium md:table-cell">Encl. temp</th>
          <th className="hidden font-medium md:table-cell">RSSI</th>
          <th className="font-medium">Last seen</th>
          <th className="hidden font-medium sm:table-cell">Schedule</th>
          <th className="">Actions</th>
        </tr>
      </thead>
      <tbody>
        {props.devices.map((d) => {
          const latestHeartbeat = d.heartbeats[0];

          return (
            <tr
              key={d.name}
              className="group h-18 items-center justify-center border-b border-border/70 transition-colors hover:bg-accent/40"
            >
              {/* name */}
              <td className="pl-4">
                <Link
                  href={`/dashboard/devices/${d.imei}`}
                  className="mb-0 block"
                >
                  <div className="flex items-end gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {d.imei}
                    </span>
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {d.name}
                    <span className="text-muted-foreground/60"> </span>
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {d.locationDescription}
                    <span className="text-muted-foreground/60"> </span>
                  </div>
                </Link>
              </td>

              {/* temperature */}
              <td className="">
                <span className={cn("tnum text-xs")}>
                  {latestHeartbeat?.cabinetTemperature
                    ? (latestHeartbeat?.cabinetTemperature).toString()
                    : "-"}
                </span>
              </td>

              {/* rssi */}
              <td className="">
                <span className={cn("tnum text-xs")}>
                  {latestHeartbeat?.rssi ?? "-"}
                </span>
              </td>

              {/* last seen */}
              <td className="">
                <span className="tnum text-xs text-muted-foreground">
                  {latestHeartbeat
                    ? new Date(latestHeartbeat.createdAt).toLocaleString()
                    : "-"}
                </span>
              </td>

              {/* sync status */}
              <td className="">
                <SyncBadge
                  synced={d.scheduleVersion == d.scheduleVersionReported}
                />
              </td>

              {/* open device */}
              <td className="">
                <OpenEntityBadge
                  href={`/dashboard/devices/${d.imei}`}
                  title="View device"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
