"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getPlace, insertPlace, restorePlaceVersion, savePlace as savePlaceData } from "@/lib/dal";
import { infoFields, writtenFields } from "@/lib/reference";
import { NewPlaceInput, parsePage } from "@/lib/validation";

/** `values` echoes what was typed, so a rejected form keeps the GM's text. */
export type PlaceFormState = { error?: string; fieldErrors?: Record<string, string[] | undefined>; values?: Record<string, string> } | undefined;

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const wiki = (campaignId: string) => `/c/${campaignId}/wiki`;

export async function createPlace(campaignId: string, parentId: string | null, _: PlaceFormState, formData: FormData): Promise<PlaceFormState> {
  const values = { type: text(formData.get("type")), title: text(formData.get("title")), lead: text(formData.get("lead")) };
  const parsed = NewPlaceInput.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const r = await insertPlace(campaignId, parentId, parsed.data);
  if ("error" in r) return { error: r.error, values };
  revalidatePath(wiki(campaignId), "layout");
  redirect(`${wiki(campaignId)}/${r.id}`);
}

export async function savePlace(campaignId: string, placeId: string, basedOn: number, _: PlaceFormState, formData: FormData): Promise<PlaceFormState> {
  const p = await getPlace(campaignId, placeId);
  const infoKeys = infoFields(p.type), sectionKeys = writtenFields(p.type).map((f) => f.key);
  // Form names: "title", "lead", "parent", "i.<infobox label>", "s.<section key>".
  const values: Record<string, string> = { title: text(formData.get("title")), lead: text(formData.get("lead")), parent: text(formData.get("parent")) };
  for (const k of infoKeys) values[`i.${k}`] = text(formData.get(`i.${k}`));
  for (const k of sectionKeys) values[`s.${k}`] = text(formData.get(`s.${k}`));
  const parsed = parsePage(p.type, {
    title: values.title, lead: values.lead,
    info: Object.fromEntries(infoKeys.map((k) => [k, values[`i.${k}`]])),
    sections: Object.fromEntries(sectionKeys.map((k) => [k, values[`s.${k}`]])),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    const name = (path: PropertyKey[]) => (path[0] === "sections" ? `s.${String(path[1])}` : path[0] === "info" ? `i.${String(path[1])}` : String(path[0]));
    for (const i of parsed.error.issues) (fieldErrors[name(i.path)] ??= []).push(i.message);
    return { fieldErrors, values };
  }
  const r = await savePlaceData(campaignId, placeId, basedOn, parsed.data, values.parent || null);
  if ("error" in r) return { error: r.error, values };
  if ("conflict" in r) {
    return { values, error: `This page was saved somewhere else while you were editing (it is now version ${r.conflict}). Nothing was overwritten. Your text is still here: copy what you need, then open the editor again.` };
  }
  revalidatePath(wiki(campaignId), "layout");
  redirect(`${wiki(campaignId)}/${placeId}`);
}

export async function restoreVersion(campaignId: string, placeId: string, number: number) {
  await restorePlaceVersion(campaignId, placeId, number);
  revalidatePath(wiki(campaignId), "layout");
  redirect(`${wiki(campaignId)}/${placeId}`);
}
