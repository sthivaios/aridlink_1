import React from "react";
import { Valves } from "@/app/dashboard/schedules/new/page";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function ValveSchedule(props: {
  valves: Valves;
  valve_id: string;
  updateCallback: (
    valveId: string,
    entryId: string,
    field: "start_at" | "duration",
    value: string
  ) => void;
  addNewWindowCallback: (valveId: string) => void;
  removeWindowCallback: (valveId: string, entryId: string) => void;
}) {
  const valve_empty: boolean =
    Object.entries(props.valves[props.valve_id].entries).length < 1;

  return (
    <Panel className="flex w-max flex-col gap-2 p-2">
      <div className="flex flex-row items-center justify-between gap-10 leading-none">
        <p className="text-sm font-bold">{props.valves[props.valve_id].name}</p>
        <Button
          className="h-min"
          type="button"
          onClick={() => {
            props.addNewWindowCallback(props.valve_id);
          }}
        >
          Add new window
        </Button>
      </div>
      <Separator />
      {valve_empty ? (
        <p>
          No irrigation windows are configured for this valve.
          <br />
          Add a new one with the button above.
        </p>
      ) : (
        Object.entries(props.valves[props.valve_id].entries).map(
          ([entryId, entry]) => (
            <div key={entryId} className="flex flex-row items-center gap-4">
              <p className="w-max text-nowrap">Start time (UTC)</p>
              <Input
                value={entry.start_at}
                onChange={(e) =>
                  props.updateCallback(
                    props.valve_id,
                    entryId,
                    "start_at",
                    e.target.value
                  )
                }
              />
              <p className="w-max text-nowrap">Duration (seconds)</p>
              <Input
                type="number"
                value={entry.duration}
                onChange={(e) =>
                  props.updateCallback(
                    props.valve_id,
                    entryId,
                    "duration",
                    e.target.value
                  )
                }
              />
              <Button
                className="hover:bg-red-400 hover:text-black"
                type="button"
                onClick={() => {
                  props.removeWindowCallback(props.valve_id, entryId);
                }}
              >
                Remove
              </Button>
            </div>
          )
        )
      )}
    </Panel>
  );
}

export default ValveSchedule;
