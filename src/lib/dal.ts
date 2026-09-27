import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";
import { childTypes, type PlaceType } from "@/lib/reference";
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
export type PlaceSummary = { id: string; parentId: string | null; type: PlaceType; title: string };

/** Every place in the campaign with its current name (taken from its newest version). */
export const listPlaces = cache(async (campaignId: string): Promise<PlaceSummary[]> => {
  const c = await getCampaign(campaignId);
  const { entry, entryRevision } = schema;
  const rows = await db.selectDistinctOn([entryRevision.entryId], { id: entry.id, parentId: entry.parentId, type: entry.type, title: entryRevision.title })
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

/** Creates a place inside `parentId` (or at the top of the Wiki) together with its first version. */
export async function insertPlace(campaignId: string, parentId: string | null, input: NewPlaceInput): Promise<{ id: string } | { error: string }> {
  const gm = await requireGM();
  const c = await getCampaign(campaignId);
  const parent = parentId ? await getPlace(c.id, parentId) : null;
  if (!childTypes(parent?.type ?? null).includes(input.type)) return { error: "That kind of place can't go here." };
  return db.transaction(async (tx) => {
    const [e] = await tx.insert(schema.entry).values({ campaignId: c.id, parentId: parent?.id ?? null, type: input.type }).returning();
    await tx.insert(schema.entryRevision).values({ entryId: e.id, number: 1, title: input.title, summary: input.summary, sections: {}, authorId: gm.id });
    return { id: e.id };
  });
}

const sameContent = (a: PageContent, b: PageContent) =>
  a.title === b.title && a.summary === b.summary &&
  JSON.stringify(Object.entries(a.sections).sort()) === JSON.stringify(Object.entries(b.sections).sort());

const isUniqueViolation = (e: unknown) => {
  const err = e as { code?: string; cause?: { code?: string } } | undefined;
  return err?.code === "23505" || err?.cause?.code === "23505";
};

/**
 * Saves a new version of a place. `basedOn` is the version the GM started editing from. If another
 * save happened in between (a second tab), nothing is overwritten and the caller gets the newer number.
 */
export async function savePlaceVersion(campaignId: string, placeId: string, basedOn: number, content: PageContent): Promise<{ saved: boolean } | { conflict: number }> {
  const gm = await requireGM();
  const p = await getPlace(campaignId, placeId);
  if (p.current.number !== basedOn) return { conflict: p.current.number };
  if (sameContent(p.current, content)) return { saved: false };
  try {
    await db.insert(schema.entryRevision).values({ entryId: p.id, number: basedOn + 1, ...content, authorId: gm.id });
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
  return savePlaceVersion(campaignId, placeId, p.current.number, { title: v.title, summary: v.summary, sections: v.sections });
}
