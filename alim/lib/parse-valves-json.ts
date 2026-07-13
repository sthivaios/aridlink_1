import { z } from "zod";

const entrySchema = z.object({
  start_at: z.string(),
  duration: z.number(),
});

const valveSchema = z.object({
  name: z.string(),
  entries: z.record(z.string(), entrySchema),
});

export const valvesSchema = z.record(z.string(), valveSchema);

export function parseValves(json: unknown) {
  return valvesSchema.parse(json);
}
