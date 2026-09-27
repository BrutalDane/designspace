import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";

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

export async function listCampaigns() {
  const gm = await requireGM();
  return db.select().from(schema.campaign).where(eq(schema.campaign.ownerId, gm.id)).orderBy(desc(schema.campaign.updatedAt));
}

/** Returns the campaign only if the signed-in GM owns it. Anything else is a 404, so ids can't be probed. */
export async function getCampaign(id: string) {
  const gm = await requireGM();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [c] = await db.select().from(schema.campaign).where(and(eq(schema.campaign.id, id), eq(schema.campaign.ownerId, gm.id)));
  if (!c) notFound();
  return c;
}

export async function insertCampaign(input: { name: string; setting: string; ruleset: string; calendar: string }) {
  const gm = await requireGM();
  const [c] = await db.insert(schema.campaign).values({ ...input, ownerId: gm.id }).returning();
  return c;
}
