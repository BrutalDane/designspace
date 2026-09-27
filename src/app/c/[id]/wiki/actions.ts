"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getPlace, insertPlace, restorePlaceVersion, savePlaceVersion } from "@/lib/dal";
import { PLACE_TYPES } from "@/lib/reference";
import { NewPlaceInput, parsePage } from "@/lib/validation";

/** `values` echoes what was typed, so a rejected form keeps the GM's text. */
export type PlaceFormState = { error?: string; fieldErrors?: Record<string, string[] | undefined>; values?: Record<string, string> } | undefined;

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const wiki = (campaignId: string) => `/c/${campaignId}/wiki`;

export async function createPlace(campaignId: string, parentId: string | null, _: PlaceFormState, formData: FormData): Promise<PlaceFormState> {
  const values = { type: text(formData.get("type")), title: text(formData.get("title")), summary: text(formData.get("summary")) };
  const parsed = NewPlaceInput.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const r = await insertPlace(campaignId, parentId, parsed.data);
  if ("error" in r) return { error: r.error, values };
  revalidatePath(wiki(campaignId), "layout");
  redirect(`${wiki(campaignId)}/${r.id}`);
}

export async function savePlace(campaignId: string, placeId: string, basedOn: number, _: PlaceFormState, formData: FormData): Promise<PlaceFormState> {
  const p = await getPlace(campaignId, placeId);
  const keys = PLACE_TYPES[p.type].sections.map((s) => s.key);
  const values: Record<string, string> = { title: text(formData.get("title")), summary: text(formData.get("summary")) };
  for (const k of keys) values[`s.${k}`] = text(formData.get(`s.${k}`));
  const parsed = parsePage(p.type, { title: values.title, summary: values.summary, sections: Object.fromEntries(keys.map((k) => [k, values[`s.${k}`]])) });
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const i of parsed.error.issues) (fieldErrors[i.path[0] === "sections" ? `s.${String(i.path[1])}` : String(i.path[0])] ??= []).push(i.message);
    return { fieldErrors, values };
  }
  const r = await savePlaceVersion(campaignId, placeId, basedOn, parsed.data);
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
