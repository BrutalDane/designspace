/**
 * The structured parts of a page that are not free text, as in the prototype: a thread's clock, a clue's routes and a
 * dungeon level's keyed areas. Stored with each page version, so they have history and restore like page text.
 */
import * as z from "zod";
import type { EntryType } from "@/lib/reference";

export const CLOCK_SEGMENTS = 5; // the prototype's clocks have five segments
export type Clock = { pos: number; portent: string };
export type Route = { text: string; found: boolean };
export type Area = { n: string; area: string; text: string };
export type PageData = { clock?: Clock; routes?: Route[]; areas?: Area[] };

/** Which structured parts a type has. */
export const dataParts = (t: EntryType) => ({ clock: t === "thread", routes: t === "clue", areas: t === "level" });

const Clock = z.object({
  pos: z.coerce.number().int().min(0, { error: "The clock runs from 0 to 5." }).max(CLOCK_SEGMENTS, { error: "The clock runs from 0 to 5." }),
  portent: z.string().trim().max(300, { error: "Keep the next portent under 300 characters." }),
});
const Area = z.object({ n: z.string().trim().max(10), area: z.string().trim().max(120), text: z.string().trim().max(2000) });

/**
 * Reads the structured parts from the editor. Routes come one per line; a route whose text is unchanged keeps its
 * "found" state. Keyed areas come as rows; empty rows are dropped. Parts the type doesn't have are ignored.
 */
export function parseData(type: EntryType, input: { clockPos?: string; portent?: string; routes?: string; areas?: Area[] }, before: PageData) {
  const parts = dataParts(type);
  const out: PageData = {};
  if (parts.clock && input.clockPos !== undefined && input.clockPos !== "") {
    const c = Clock.safeParse({ pos: input.clockPos, portent: input.portent ?? "" });
    if (!c.success) return { error: c.error.issues[0].message } as const;
    out.clock = c.data;
  }
  if (parts.routes) {
    const lines = (input.routes ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 20 || lines.some((l) => l.length > 500)) return { error: "Keep routes to 20 lines of up to 500 characters." } as const;
    const found = new Map((before.routes ?? []).map((r) => [r.text, r.found]));
    if (lines.length) out.routes = lines.map((text) => ({ text, found: found.get(text) ?? false }));
  }
  if (parts.areas) {
    const rows = z.array(Area).max(100).safeParse(input.areas ?? []);
    if (!rows.success) return { error: "Keep keyed areas short: up to 100 rows." } as const;
    const kept = rows.data.filter((a) => a.n || a.area || a.text);
    if (kept.length) out.areas = kept;
  }
  return { data: out } as const;
}

/** Names the structured parts that differ between two versions. */
export function changedData(before: PageData, after: PageData): string[] {
  const parts: string[] = [];
  if (JSON.stringify(before.clock ?? null) !== JSON.stringify(after.clock ?? null)) parts.push("Clock");
  if (JSON.stringify(before.routes ?? []) !== JSON.stringify(after.routes ?? [])) parts.push("Routes");
  if (JSON.stringify(before.areas ?? []) !== JSON.stringify(after.areas ?? [])) parts.push("Keyed areas");
  return parts;
}
