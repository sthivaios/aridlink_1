// schedule json stuff
type ScheduleEntry = {
  start_at: string;
  duration: number;
};
type Valve = {
  name: string;
  entries: Record<string, ScheduleEntry>;
};
export type Valves = Record<string, Valve>;
