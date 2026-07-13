import { Valves } from "@/lib/types";

export function compileScheduleJson(valves: Valves) {
  return Object.fromEntries(
    Object.entries(valves).map(([valveId, valve]) => [
      valveId,
      Object.values(valve.entries).map((entry) => ({
        start: entry.start_at,
        duration_s: entry.duration,
      })),
    ])
  );
}