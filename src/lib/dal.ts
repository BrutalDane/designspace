import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";
import { childTypes, PLACE_TYPES, type PlaceType } from "@/lib/reference";
import { ancestors } from "@/lib/tree";
import { linkIndex, linkTargets, pageText } from "@/lib/links";
import type { NewPlaceInput, PageContent } from "@/lib/validation";

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

/* ---------- Wiki: places ---------- */
export type PlaceSummary = { id: string; parentId: string | null; type: PlaceType; title: string; lead: string };

/** Every place in the campaign with its current title and lead (taken from its newest version). */
export const listPlaces = cache(async (campaignId: string): Promise<PlaceSummary[]> => {
  const c = await getCampaign(campaignId);
  const { entry, entryRevision } = schema;
  const rows = await db.selectDistinctOn([entryRevision.entryId], { id: entry.id, parentId: entry.parentId, type: entry.type, title: entryRevision.title, lead: entryRevision.lead })
    .from(entry).innerJoin(entryRevision, eq(entryRevision.entryId, entry.id))
    .where(eq(entry.campaignId, c.id))
    .orderBy(entryRevision.entryId, desc(entryRevision.number));
  return rows.map((r) => ({ ...r, type: r.type as PlaceType }));
});

/** A place and its current version. 404 unless it belongs to a campaign the signed-in GM owns. */
export const getPlace = cache(async (campaignId: string, placeId: string) => {
  const c = await getCampaign(campaignId);
  if (!isId(placeId)) notFound();
  const [e] = await db.select().from(schema.entry).where(and(eq(schema.entry.id, placeId), eq(schema.entry.campaignId, c.id)));
  if (!e) notFound();
  const [current] = await db.select().from(schema.entryRevision)
    .where(eq(schema.entryRevision.entryId, e.id)).orderBy(desc(schema.entryRevision.number)).limit(1);
  return { ...e, type: e.type as PlaceType, current };
});

/** All versions of a place, newest first, with the name of whoever saved each one. */
export async function listVersions(campaignId: string, placeId: string) {
  const p = await getPlace(campaignId, placeId);
  return db.select({ version: schema.entryRevision, author: schema.user.name })
    .from(schema.entryRevision).innerJoin(schema.user, eq(schema.user.id, schema.entryRevision.authorId))
    .where(eq(schema.entryRevision.entryId, p.id)).orderBy(desc(schema.entryRevision.number));
}

export async function getVersion(campaignId: string, placeId: string, number: number) {
  const p = await getPlace(campaignId, placeId);
  if (!Number.isInteger(number) || number < 1) notFound();
  const [v] = await db.select().from(schema.entryRevision)
    .where(and(eq(schema.entryRevision.entryId, p.id), eq(schema.entryRevision.number, number)));
  if (!v) notFound();
  return v;
}

/** Places a page may move under: allowed parent types only, never itself or anything inside it. */
export async function validParents(campaignId: string, placeId: string) {
  const [p, places] = await Promise.all([getPlace(campaignId, placeId), listPlaces(campaignId)]);
  return places
    .filter((x) => PLACE_TYPES[p.type].parents.includes(x.type) && x.id !== p.id && !ancestors(places, x.id).some((a) => a.id === p.id))
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Creates a place inside `parentId` (or at the top of the Wiki) together with its first version. */
export async function insertPlace(campaignId: string, parentId: string | null, input: NewPlaceInput): Promise<{ id: string } | { error: string }> {
  const gm = await requireGM();
  const c = await getCampaign(campaignId);
  const parent = parentId ? await getPlace(c.id, parentId) : null;
  if (!childTypes(parent?.type ?? null).includes(input.type)) return { error: "That kind of place can't go here." };
  return db.transaction(async (tx) => {
    const [e] = await tx.insert(schema.entry).values({ campaignId: c.id, parentId: parent?.id ?? null, type: input.type }).returning();
    await tx.insert(schema.entryRevision).values({ entryId: e.id, number: 1, title: input.title, lead: input.lead, info: {}, sections: {}, authorId: gm.id });
    return { id: e.id };
  });
}

const sorted = (r: Record<string, string>) => JSON.stringify(Object.entries(r).sort());
const sameContent = (a: PageContent, b: PageContent) =>
  a.title === b.title && a.lead === b.lead && sorted(a.info) === sorted(b.info) && sorted(a.sections) === sorted(b.sections);

const isUniqueViolation = (e: unknown) => {
  const err = e as { code?: string; cause?: { code?: string } } | undefined;
  return err?.code === "23505" || err?.cause?.code === "23505";
};

/**
 * Saves a new version of a place and, if `parentId` changed, moves it in the tree. `basedOn` is the version the GM
 * started editing from; if another save happened in between (a second tab), nothing is changed and the caller gets
 * the newer number. The Parent is where the page sits, not page text, so a move is not a new version.
 */
export async function savePlace(campaignId: string, placeId: string, basedOn: number, content: PageContent, parentId: string | null):
  Promise<{ saved: boolean } | { conflict: number } | { error: string }> {
  const gm = await requireGM();
  const p = await getPlace(campaignId, placeId);
  if (p.current.number !== basedOn) return { conflict: p.current.number };
  const moving = parentId !== p.parentId;
  if (moving) {
    if (parentId === null ? PLACE_TYPES[p.type].parents.length > 0 : !(await validParents(campaignId, placeId)).some((x) => x.id === parentId)) {
      return { error: `A ${PLACE_TYPES[p.type].label.toLowerCase()} can't go there.` };
    }
  }
  const newVersion = !sameContent(p.current, content);
  if (!moving && !newVersion) return { saved: false };
  try {
    await db.transaction(async (tx) => {
      if (moving) await tx.update(schema.entry).set({ parentId }).where(eq(schema.entry.id, p.id));
      if (newVersion) await tx.insert(schema.entryRevision).values({ entryId: p.id, number: basedOn + 1, ...content, authorId: gm.id });
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { conflict: basedOn + 1 };
    throw e;
  }
  return { saved: true };
}

/** Brings back an older version by saving a copy of it as the newest version. History is never rewritten. */
export async function restorePlaceVersion(campaignId: string, placeId: string, number: number) {
  const p = await getPlace(campaignId, placeId);
  const v = await getVersion(campaignId, placeId, number);
  return savePlace(campaignId, placeId, p.current.number, { title: v.title, lead: v.lead, info: v.info, sections: v.sections }, p.parentId);
}

/** The current text of every place in the campaign, for working out links. */
const listPlaceTexts = cache(async (campaignId: string) => {
  const c = await getCampaign(campaignId);
  const { entry, entryRevision } = schema;
  return db.selectDistinctOn([entryRevision.entryId], { id: entry.id, lead: entryRevision.lead, info: entryRevision.info, sections: entryRevision.sections })
    .from(entry).innerJoin(entryRevision, eq(entryRevision.entryId, entry.id))
    .where(eq(entry.campaignId, c.id))
    .orderBy(entryRevision.entryId, desc(entryRevision.number));
});

/** Pages this place links to, and pages that link to it. Worked out from page text; nothing is stored twice. */
export async function placeLinks(campaignId: string, placeId: string) {
  const [p, places, texts] = await Promise.all([getPlace(campaignId, placeId), listPlaces(campaignId), listPlaceTexts(campaignId)]);
  const index = linkIndex(places);
  const byId = new Map(places.map((x) => [x.id, x]));
  const linksTo = linkTargets(pageText(p.current), index).filter((id) => id !== p.id);
  const linkedFrom = texts.filter((t) => t.id !== p.id && linkTargets(pageText(t), index).includes(p.id)).map((t) => t.id);
  const pick = (ids: string[]) => ids.map((id) => byId.get(id)!).filter(Boolean).sort((a, b) => a.title.localeCompare(b.title));
  return { linksTo: pick(linksTo), linkedFrom: pick(linkedFrom) };
}
