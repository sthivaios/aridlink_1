"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import ValveSchedule from "@/components/valve-schedule";
import { CancelScheduleEdit } from "@/app/dashboard/schedules/new/cancel";
import { Button } from "@/components/ui/button";
import { scheduleUpsert } from "@/app/dashboard/schedules/new/upsert-schedule";
import { tryCatch } from "@/lib/try-catch";
import { toast } from "sonner";
import { Valves } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Device, ScheduleProfile } from "@/lib/generated/prisma/client";
import { Separator } from "@/components/ui/separator";

export function UpsertScheduleForm(props: {
  valves: Valves;
  fullCspObject?: ScheduleProfile & { devices: Device[] };
}) {
  const [name, setName] = React.useState(props.fullCspObject?.name ?? "");
  const [description, setDescription] = React.useState(
    props.fullCspObject?.description ?? ""
  );
  const [valves, setValves] = React.useState<Valves>(props.valves);

  function handleUpdate(
    valveId: string,
    entryId: string,
    field: "start_at" | "duration",
    value: string
  ) {
    setValves((prev) => ({
      ...prev,
      [valveId]: {
        ...prev[valveId],
        entries: {
          ...prev[valveId].entries,
          [entryId]: {
            ...prev[valveId].entries[entryId],
            [field]: field === "duration" ? Number(value) : value,
          },
        },
      },
    }));
  }

  function handleAddWindow(valveId: string) {
    const newEntryId = crypto.randomUUID();

    setValves((prev) => ({
      ...prev,
      [valveId]: {
        ...prev[valveId],
        entries: {
          ...prev[valveId].entries,
          [newEntryId]: { start_at: "06:00", duration: 60 },
        },
      },
    }));
  }

  function handleRemoveWindow(valveId: string, entryId: string) {
    setValves((prev) => {
      const newEntries = { ...prev[valveId].entries };
      delete newEntries[entryId];

      return {
        ...prev,
        [valveId]: {
          ...prev[valveId],
          entries: newEntries,
        },
      };
    });
  }

  return (
    <form className="flex w-full flex-col items-start gap-5">
      <h1 className="text-2xl">Common Schedule Profile (CSP) Creation Wizard</h1>
      <Separator />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg">CSP Information</h2>
        <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-4">
          <Label>Schedule name</Label>
          <Input
            className="min-w-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Label>Description</Label>
          <Input
            className="min-w-xl"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {props.fullCspObject ? (
            <>
              <Label>Created at</Label>
              <Input
                className="min-w-xl"
                value={`${new Date(props.fullCspObject.createdAt)
                  .toISOString()
                  .replace("T", " - ")
                  .replace(/\.\d+Z$/, "")}`}
                readOnly={true}
              />

              <Label>Last update at</Label>
              <Input
                className="min-w-xl"
                value={`${props.fullCspObject.updatedAt}`}
                readOnly={true}
              />

              <Label>
                Current version
                <br />
                for debugging purposes
              </Label>
              <Input
                className="min-w-xl"
                value={`${props.fullCspObject.version}`}
                readOnly={true}
              />

              <Label>In use by</Label>
              <Input
                className="min-w-xl"
                value={`${props.fullCspObject.devices.length} devices`}
                readOnly={true}
              />
            </>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg">Irrigation Schedule</h2>
        <div className="flex flex-col gap-6">
          {Object.entries(valves).map(([valveId]) => (
            <ValveSchedule
              valves={valves}
              key={valveId}
              valve_id={valveId}
              updateCallback={handleUpdate}
              addNewWindowCallback={handleAddWindow}
              removeWindowCallback={handleRemoveWindow}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <CancelScheduleEdit />
        <Button
          type="button"
          onClick={async () => {
            const { data, error } = await tryCatch(
              scheduleUpsert(name, description, valves, props.fullCspObject?.id)
            );
            if (error || !data) {
              toast.error(error.message);
            } else {
              toast.success(`Schedule ${name} created.`);
              window.location.replace(`/dashboard/schedules`);
            }
          }}
        >
          Save and submit
        </Button>
      </div>
    </form>
  );
}
