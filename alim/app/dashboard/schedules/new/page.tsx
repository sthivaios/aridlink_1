"use client";

import React from "react";
import { Valves } from "@/lib/types";
import { UpsertScheduleForm } from "@/app/dashboard/schedules/upsertScheduleForm";

function Page() {

  const blankValves: Valves = {
    "valve-1": {
      name: "Valve 1",
      entries: {},
    },
    "valve-2": {
      name: "Valve 2",
      entries: {},
    },
    "valve-3": {
      name: "Valve 3",
      entries: {},
    },
    "valve-4": {
      name: "Valve 4",
      entries: {},
    },
  };

  return (
    <div>
      <UpsertScheduleForm valves={blankValves} />
    </div>
  );
}

export default Page;
