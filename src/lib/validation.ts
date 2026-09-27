import * as z from "zod";
import { RULESETS, CALENDARS, ENTRY_TYPES, infoFields, writtenFields, type EntryType } from "@/lib/reference";
import { changedData, type PageData } from "@/lib/page-data";

export const CampaignInput = z.object({
  name: z.string().trim().min(2, { error: "Give the campaign a name of at least 2 characters." }).max(80, { error: "Keep the name under 80 characters." }),
  setting: z.string().trim().max(200, { error: "Keep the setting under 200 characters." }).default(""),
  ruleset: z.enum(Object.keys(RULESETS) as [string, ...string[]], { error: "Pick a ruleset from the list." }),
  calendar: z.enum(Object.keys(CALENDARS) as [string, ...string[]], { error: "Pick a calendar from the list." }),
});
export type CampaignInput = z.infer<typeof CampaignInput>;

export const SignInInput = z.object({
  email: z.email({ error: "Enter the email address of the GM account." }).trim(),
  password: z.string().min(1, { error: "Enter your password." }),
});

const title = z.string().trim().min(1, { error: "Give the page a title." }).max(120, { error: "Keep the title under 120 characters." });
const lead = z.string().trim().max(2000, { error: "Keep the lead under 2,000 characters." });

export const NewPageInput = z.object({
  type: z.enum(Object.keys(ENTRY_TYPES) as [EntryType, ...EntryType[]], { error: "Pick what kind of place this is." }),
  title,
  lead,
});
export type NewPageInput = z.infer<typeof NewPageInput>;

export type PageContent = { title: string; lead: string; info: Record<string, string>; sections: Record<string, string> };
/** A whole page version: its text plus the structured parts (clock, routes, keyed areas). */
export type PageVersion = PageContent & { data: PageData };

const dropEmpty = (r: Record<string, string>) => Object.fromEntries(Object.entries(r).filter(([, v]) => v !== ""));

/** Reads an edited page for the given type. Only that type's infobox fields and sections are kept; empty ones are dropped. */
export function parsePage(type: EntryType, data: { title: unknown; lead: unknown; info: Record<string, unknown>; sections: Record<string, unknown> }) {
  const short = z.string().trim().max(200, { error: "Keep infobox values under 200 characters." }).default("");
  const long = z.string().trim().max(20000, { error: "Keep each section under 20,000 characters." }).default("");
  return z.object({
    title,
    lead: lead.default(""),
    info: z.object(Object.fromEntries(infoFields(type).map((k) => [k, short]))),
    sections: z.object(Object.fromEntries(writtenFields(type).map((f) => [f.key, long]))),
  })
    .transform((p): PageContent => ({ title: p.title, lead: p.lead, info: dropEmpty(p.info), sections: dropEmpty(p.sections) }))
    .safeParse(data);
}

/** Names the parts of a page that differ between two versions, in page order. */
export function changedParts(type: EntryType, before: PageVersion | undefined, after: PageVersion): string[] {
  if (!before) return ["Created"];
  const parts: string[] = [];
  if (before.title !== after.title) parts.push("Title");
  if (before.lead !== after.lead) parts.push("Lead");
  for (const k of infoFields(type)) if ((before.info[k] ?? "") !== (after.info[k] ?? "")) parts.push(k);
  for (const f of writtenFields(type)) if ((before.sections[f.key] ?? "") !== (after.sections[f.key] ?? "")) parts.push(f.label);
  parts.push(...changedData(before.data, after.data));
  return parts;
}
