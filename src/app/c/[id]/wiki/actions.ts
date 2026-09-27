"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getPage, insertPage, listPages, restorePageVersion, savePage as savePageData } from "@/lib/dal";
import { linkIndex, toStored, type LinkIndex } from "@/lib/links";
import { REF_FIELDS, infoFields, writtenFields } from "@/lib/reference";
import { NewPageInput, parsePage } from "@/lib/validation";

/** `values` echoes what was typed, so a rejected form keeps the GM's text. */
export type PageFormState = { error?: string; fieldErrors?: Record<string, string[] | undefined>; values?: Record<string, string> } | undefined;

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");
const wiki = (campaignId: string) => `/c/${campaignId}/wiki`;

/** Turns typed [[Title]] links into stable page ids. Ambiguous titles become an error on that field. */
function storeLinks(fields: Record<string, string>, index: LinkIndex) {
  const out: Record<string, string> = {}, errors: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(fields)) {
    const r = toStored(v, index);
    out[k] = r.text;
    if (r.ambiguous.length) errors[k] = [`Two pages are called "${r.ambiguous[0]}". Rename one of them, then link again.`];
  }
  return { out, errors };
}

export async function createPage(campaignId: string, parentId: string | null, _: PageFormState, formData: FormData): Promise<PageFormState> {
  const values = { type: text(formData.get("type")), title: text(formData.get("title")), lead: text(formData.get("lead")) };
  const parsed = NewPageInput.safeParse(values);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const links = storeLinks({ lead: parsed.data.lead }, linkIndex(await listPages(campaignId)));
  if (Object.keys(links.errors).length) return { fieldErrors: links.errors, values };
  const r = await insertPage(campaignId, parentId, { ...parsed.data, lead: links.out.lead });
  if ("error" in r) return { error: r.error, values };
  revalidatePath(wiki(campaignId), "layout");
  redirect(`${wiki(campaignId)}/${r.id}`);
}

export async function savePage(campaignId: string, pageId: string, basedOn: number, _: PageFormState, formData: FormData): Promise<PageFormState> {
  const p = await getPage(campaignId, pageId);
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
  const flat: Record<string, string> = { lead: parsed.data.lead };
  // Location, Faction and Holder come from a list of pages (an id); they are stored as a link to that page.
  for (const [k, v] of Object.entries(parsed.data.info)) flat[`i.${k}`] = REF_FIELDS[k] ? `[[${v}]]` : v;
  for (const [k, v] of Object.entries(parsed.data.sections)) flat[`s.${k}`] = v;
  const links = storeLinks(flat, linkIndex(await listPages(campaignId)));
  if (Object.keys(links.errors).length) return { fieldErrors: links.errors, values };
  const content = {
    title: parsed.data.title, lead: links.out.lead,
    info: Object.fromEntries(Object.keys(parsed.data.info).map((k) => [k, links.out[`i.${k}`]])),
    sections: Object.fromEntries(Object.keys(parsed.data.sections).map((k) => [k, links.out[`s.${k}`]])),
  };
  const r = await savePageData(campaignId, pageId, basedOn, content, values.parent || null);
  if ("error" in r) return { error: r.error, values };
  if ("conflict" in r) {
    return { values, error: `This page was saved somewhere else while you were editing (it is now version ${r.conflict}). Nothing was overwritten. Your text is still here: copy what you need, then open the editor again.` };
  }
  revalidatePath(wiki(campaignId), "layout");
  redirect(`${wiki(campaignId)}/${pageId}`);
}

export async function restoreVersion(campaignId: string, pageId: string, number: number) {
  await restorePageVersion(campaignId, pageId, number);
  revalidatePath(wiki(campaignId), "layout");
  redirect(`${wiki(campaignId)}/${pageId}`);
}
