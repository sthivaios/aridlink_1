import { Valves } from "@/lib/types";

type FlatWindow = [startMin: number, durationS: number, valve: number];

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export async function compileScheduleJson(
  valves: Valves
): Promise<FlatWindow[]> {
  return Object.entries(valves).flatMap(([valveId, valve]) => {
    const valve_num = Number(valveId.split("-")[1]);
    return Object.values(valve.entries).map(
      (entry): FlatWindow => [
        timeToMinutes(entry.start_at),
        entry.duration,
        valve_num,
      ]
    );
  });
}
