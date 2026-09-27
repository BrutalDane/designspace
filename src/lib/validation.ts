import * as z from "zod";
import { RULESETS, CALENDARS, PLACE_TYPES, type PlaceType } from "@/lib/reference";

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

const title = z.string().trim().min(1, { error: "Give the page a name." }).max(120, { error: "Keep the name under 120 characters." });
const summary = z.string().trim().max(2000, { error: "Keep the summary under 2,000 characters." });

export const NewPlaceInput = z.object({
  type: z.enum(Object.keys(PLACE_TYPES) as [PlaceType, ...PlaceType[]], { error: "Pick what kind of place this is." }),
  title,
  summary,
});
export type NewPlaceInput = z.infer<typeof NewPlaceInput>;

export type PageContent = { title: string; summary: string; sections: Record<string, string> };

/** Reads an edited page for the given kind of place. Only that layout's sections are kept, and empty ones are dropped. */
export function parsePage(type: PlaceType, data: { title: unknown; summary: unknown; sections: Record<string, unknown> }) {
  const sectionText = z.string().trim().max(20000, { error: "Keep each section under 20,000 characters." });
  const shape = Object.fromEntries(PLACE_TYPES[type].sections.map((s) => [s.key, sectionText.default("")]));
  return z.object({ title, summary: summary.default(""), sections: z.object(shape) })
    .transform((p): PageContent => ({ ...p, sections: Object.fromEntries(Object.entries(p.sections).filter(([, v]) => v !== "")) }))
    .safeParse(data);
}

/** Names the parts of a page that differ between two versions, in page order. */
export function changedParts(type: PlaceType, before: PageContent | undefined, after: PageContent): string[] {
  if (!before) return ["Created"];
  const parts: string[] = [];
  if (before.title !== after.title) parts.push("Name");
  if (before.summary !== after.summary) parts.push("Summary");
  for (const s of PLACE_TYPES[type].sections) if ((before.sections[s.key] ?? "") !== (after.sections[s.key] ?? "")) parts.push(s.heading);
  return parts;
}
