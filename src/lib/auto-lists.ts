/**
 * Lists that build themselves, as decided (reference/designspace-decisions.md → Hierarchy). Nothing is kept up to date
 * by hand; each list is worked out from Parent and from the Location, Faction and Holder fields. No database access.
 */
import type { EntryType } from "@/lib/reference";

type Page = { id: string; parentId: string | null; type: EntryType; info: Record<string, string> };

/** The page id in a reference field value ("[[id]]"), if any. */
export const refId = (value: string | undefined) => /^\[\[([0-9a-f-]{36})\]\]$/i.exec(value?.trim() ?? "")?.[1]?.toLowerCase() ?? null;

/** A page and everything inside it, at any depth. */
function withDescendants(pages: Page[], id: string): Set<string> {
  const out = new Set([id]);
  for (let grew = true; grew;) {
    grew = false;
    for (const p of pages) if (p.parentId && out.has(p.parentId) && !out.has(p.id)) { out.add(p.id); grew = true; }
  }
  return out;
}

/** People here: people whose Location is this place or anywhere inside it. */
export function peopleHere<T extends Page>(pages: T[], placeId: string): T[] {
  const inside = withDescendants(pages, placeId);
  return pages.filter((p) => (p.type === "npc" || p.type === "pc") && inside.has(refId(p.info.Location) ?? ""));
}

/** Members: people whose Faction is this faction or one of its branches. */
export function members<T extends Page>(pages: T[], factionId: string): T[] {
  const branches = withDescendants(pages, factionId);
  return pages.filter((p) => p.type === "npc" && branches.has(refId(p.info.Faction) ?? ""));
}

/** Carries: items whose Holder is this person. */
export function carries<T extends Page>(pages: T[], personId: string): T[] {
  return pages.filter((p) => p.type === "item" && refId(p.info.Holder) === personId);
}

/** The party's members: the player characters. */
export function partyMembers<T extends Page>(pages: T[]): T[] {
  return pages.filter((p) => p.type === "pc");
}

/** Clocks: threads with a clock whose "Driven by" is this NPC or faction (decided: clocks live on threads). */
export function drivenBy<T extends Page & { data: { clock?: unknown } }>(pages: T[], id: string): T[] {
  return pages.filter((p) => p.type === "thread" && p.data.clock && refId(p.info["Driven by"]) === id);
}
