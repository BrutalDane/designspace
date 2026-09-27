import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";
import { childTypes, ENTRY_TYPES, REF_FIELDS, type EntryType } from "@/lib/reference";
import { refId } from "@/lib/auto-lists";
import { ancestors } from "@/lib/tree";
import { linkIndex, linkTargets, pageText } from "@/lib/links";
import type { NewPageInput, PageVersion } from "@/lib/validation";
import type { PageData } from "@/lib/page-data";

/**
 * Data access layer. Every read or write of campaign data goes through here,
 * and every function checks who is asking. Pages never query the database directly.
 */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireGM() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s.user;
}

const isId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function listCampaigns() {
  const gm = await requireGM();
  return db.select().from(schema.campaign).where(eq(schema.campaign.ownerId, gm.id)).orderBy(desc(schema.campaign.updatedAt));
}

/** Returns the campaign only if the signed-in GM owns it. Anything else is a 404, so ids can't be probed. */
export const getCampaign = cache(async (id: string) => {
  const gm = await requireGM();
  if (!isId(id)) notFound();
  const [c] = await db.select().from(schema.campaign).where(and(eq(schema.campaign.id, id), eq(schema.campaign.ownerId, gm.id)));
  if (!c) notFound();
  return c;
});

export async function insertCampaign(input: { name: string; setting: string; ruleset: string; calendar: string }) {
  const gm = await requireGM();
  const [c] = await db.insert(schema.campaign).values({ ...input, ownerId: gm.id }).returning();
  return c;
}

/* ---------- Wiki pages ---------- */
export type PageSummary = { id: string; parentId: string | null; type: EntryType; title: string; lead: string; info: Record<string, string>; data: PageData };

/** Every page in the campaign with its current title, lead and infobox values (taken from its newest version). */
export const listPages = cache(async (campaignId: string): Promise<PageSummary[]> => {
  const c = await getCampaign(campaignId);
  const { entry, entryRevision } = schema;
  const rows = await db.selectDistinctOn([entryRevision.entryId], { id: entry.id, parentId: entry.parentId, type: entry.type, title: entryRevision.title, lead: entryRevision.lead, info: entryRevision.info, data: entryRevision.data })
    .from(entry).innerJoin(entryRevision, eq(entryRevision.entryId, entry.id))
    .where(eq(entry.campaignId, c.id))
    .orderBy(entryRevision.entryId, desc(entryRevision.number));
  return rows.map((r) => ({ ...r, type: r.type as EntryType }));
});

/** A place and its current version. 404 unless it belongs to a campaign the signed-in GM owns. */
export const getPage = cache(async (campaignId: string, pageId: string) => {
  const c = await getCampaign(campaignId);
  if (!isId(pageId)) notFound();
  const [e] = await db.select().from(schema.entry).where(and(eq(schema.entry.id, pageId), eq(schema.entry.campaignId, c.id)));
  if (!e) notFound();
  const [current] = await db.select().from(schema.entryRevision)
    .where(eq(schema.entryRevision.entryId, e.id)).orderBy(desc(schema.entryRevision.number)).limit(1);
  return { ...e, type: e.type as EntryType, current };
});

/** All versions of a place, newest first, with the name of whoever saved each one. */
export async function listVersions(campaignId: string, pageId: string) {
  const p = await getPage(campaignId, pageId);
  return db.select({ version: schema.entryRevision, author: schema.user.name })
    .from(schema.entryRevision).innerJoin(schema.user, eq(schema.user.id, schema.entryRevision.authorId))
    .where(eq(schema.entryRevision.entryId, p.id)).orderBy(desc(schema.entryRevision.number));
}

export async function getVersion(campaignId: string, pageId: string, number: number) {
  const p = await getPage(campaignId, pageId);
  if (!Number.isInteger(number) || number < 1) notFound();
  const [v] = await db.select().from(schema.entryRevision)
    .where(and(eq(schema.entryRevision.entryId, p.id), eq(schema.entryRevision.number, number)));
  if (!v) notFound();
  return v;
}

/** Places a page may move under: allowed parent types only, never itself or anything inside it. */
export async function validParents(campaignId: string, pageId: string) {
  const [p, places] = await Promise.all([getPage(campaignId, pageId), listPages(campaignId)]);
  return places
    .filter((x) => ENTRY_TYPES[p.type].parents.includes(x.type) && x.id !== p.id && !ancestors(places, x.id).some((a) => a.id === p.id))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Creates a place inside `parentId` (or at the top of the Wiki) together with its first version. */
export async function insertPage(campaignId: string, parentId: string | null, input: NewPageInput): Promise<{ id: string } | { error: string }> {
  const gm = await requireGM();
  const c = await getCampaign(campaignId);
  const parent = parentId ? await getPage(c.id, parentId) : null;
  if (!childTypes(parent?.type ?? null).includes(input.type)) return { error: "That kind of place can't go here." };
  return db.transaction(async (tx) => {
    const [e] = await tx.insert(schema.entry).values({ campaignId: c.id, parentId: parent?.id ?? null, type: input.type }).returning();
    await tx.insert(schema.entryRevision).values({ entryId: e.id, number: 1, title: input.title, lead: input.lead, info: {}, sections: {}, data: {}, authorId: gm.id });
    return { id: e.id };
  });
}

const sorted = (r: Record<string, string>) => JSON.stringify(Object.entries(r).sort());
const sameContent = (a: PageVersion, b: PageVersion) =>
  a.title === b.title && a.lead === b.lead && sorted(a.info) === sorted(b.info) && sorted(a.sections) === sorted(b.sections)
  && JSON.stringify(a.data) === JSON.stringify(b.data);

const isUniqueViolation = (e: unknown) => {
  const err = e as { code?: string; cause?: { code?: string } } | undefined;
  return err?.code === "23505" || err?.cause?.code === "23505";
};

/**
 * Saves a new version of a place and, if `parentId` changed, moves it in the tree. `basedOn` is the version the GM
 * started editing from; if another save happened in between (a second tab), nothing is changed and the caller gets
 * the newer number. The Parent is where the page sits, not page text, so a move is not a new version.
 */
export async function savePage(campaignId: string, pageId: string, basedOn: number, content: PageVersion, parentId: string | null):
  Promise<{ saved: boolean } | { conflict: number } | { error: string }> {
  const gm = await requireGM();
  const p = await getPage(campaignId, pageId);
  if (p.current.number !== basedOn) return { conflict: p.current.number };
  const moving = parentId !== p.parentId;
  if (moving) {
    if (parentId === null ? !ENTRY_TYPES[p.type].root : !(await validParents(campaignId, pageId)).some((x) => x.id === parentId)) {
      return { error: `A ${ENTRY_TYPES[p.type].label.toLowerCase()} can't go there.` };
    }
  }
  // Location, Faction and Holder must point at a page of an allowed type in this campaign (never typed by hand).
  const pages = await listPages(campaignId);
  for (const [field, types] of Object.entries(REF_FIELDS)) {
    const v = content.info[field];
    if (!v) continue;
    const target = pages.find((x) => x.id === refId(v));
    if (!target || !types.includes(target.type) || target.id === p.id) return { error: `${field} must be one of the pages offered in the list.` };
  }
  const newVersion = !sameContent(p.current, content);
  if (!moving && !newVersion) return { saved: false };
  try {
    await db.transaction(async (tx) => {
      if (moving) await tx.update(schema.entry).set({ parentId }).where(eq(schema.entry.id, p.id));
      if (newVersion) await tx.insert(schema.entryRevision).values({
        entryId: p.id, number: basedOn + 1, authorId: gm.id,
        title: content.title, lead: content.lead, info: content.info, sections: content.sections, data: content.data,
      });
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { conflict: basedOn + 1 };
    throw e;
  }
  return { saved: true };
}

/** Brings back an older version by saving a copy of it as the newest version. History is never rewritten. */
export async function restorePageVersion(campaignId: string, pageId: string, number: number) {
  const p = await getPage(campaignId, pageId);
  const v = await getVersion(campaignId, pageId, number);
  return savePage(campaignId, pageId, p.current.number, { title: v.title, lead: v.lead, info: v.info, sections: v.sections, data: v.data }, p.parentId);
}

/** The current text of every place in the campaign, for working out links. */
export const listPageTexts = cache(async (campaignId: string) => {
  const c = await getCampaign(campaignId);
  const { entry, entryRevision } = schema;
  return db.selectDistinctOn([entryRevision.entryId], { id: entry.id, lead: entryRevision.lead, info: entryRevision.info, sections: entryRevision.sections })
    .from(entry).innerJoin(entryRevision, eq(entryRevision.entryId, entry.id))
    .where(eq(entry.campaignId, c.id))
    .orderBy(entryRevision.entryId, desc(entryRevision.number));
});

/** Pages this place links to, and pages that link to it. Worked out from page text; nothing is stored twice. */
export async function pageLinks(campaignId: string, pageId: string) {
  const [p, places, texts] = await Promise.all([getPage(campaignId, pageId), listPages(campaignId), listPageTexts(campaignId)]);
  const index = linkIndex(places);
  const byId = new Map(places.map((x) => [x.id, x]));
  const linksTo = linkTargets(pageText(p.current), index).filter((id) => id !== p.id);
  const linkedFrom = texts.filter((t) => t.id !== p.id && linkTargets(pageText(t), index).includes(p.id)).map((t) => t.id);
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)!).filter(Boolean).sort((a, b) => a.title.localeCompare(b.title));
  return { linksTo: pick(linksTo), linkedFrom: pick(linkedFrom) };
}

/** Marks one route to a clue found or not found. A new version, like any other GM edit. */
export async function setRouteFound(campaignId: string, pageId: string, basedOn: number, index: number, found: boolean) {
  const p = await getPage(campaignId, pageId);
  const routes = p.current.data.routes ?? [];
  if (p.type !== "clue" || !Number.isInteger(index) || !routes[index]) notFound();
  const data = { ...p.current.data, routes: routes.map((r, i) => (i === index ? { ...r, found } : r)) };
  const { title, lead, info, sections } = p.current;
  return savePage(campaignId, pageId, basedOn, { title, lead, info, sections, data }, p.parentId);
}
