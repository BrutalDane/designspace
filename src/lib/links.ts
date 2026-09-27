/**
 * Wiki links, as in the prototype: [[Page]] or [[Page|shown text]], plus **bold**, *italic* and "- " lists.
 * The GM types page titles; saved text stores the page id, so renaming a page never breaks links to it.
 * Links are read from the page text itself, never stored separately. No database access here.
 */
const LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type LinkPage = { id: string; title: string };
export const normTitle = (t: string) => t.normalize("NFC").trim().toLocaleLowerCase();

/** Looks up pages by id and by title. Two pages with the same title make that title ambiguous. */
export function linkIndex(pages: LinkPage[]) {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const byTitle = new Map<string, LinkPage | "ambiguous">();
  for (const p of pages) byTitle.set(normTitle(p.title), byTitle.has(normTitle(p.title)) ? "ambiguous" : p);
  /** The page a link target points to, if any: an id of a page in this campaign, or a unique title. */
  const resolve = (target: string): LinkPage | null => {
    const t = target.trim();
    if (ID.test(t)) return byId.get(t.toLowerCase()) ?? null;
    const hit = byTitle.get(normTitle(t));
    return hit && hit !== "ambiguous" ? hit : null;
  };
  return { byId, byTitle, resolve };
}
export type LinkIndex = ReturnType<typeof linkIndex>;

/** Text as saved: [[Title]] becomes [[id]]. Unknown titles stay as typed (a link to a page that doesn't exist yet). */
export function toStored(text: string, index: LinkIndex): { text: string; ambiguous: string[] } {
  const ambiguous: string[] = [];
  const out = text.replace(LINK, (m, target: string, label?: string) => {
    const t = target.trim();
    if (ID.test(t)) return m;
    const hit = index.byTitle.get(normTitle(t));
    if (hit === "ambiguous") { ambiguous.push(t); return m; }
    return hit ? `[[${hit.id}${label ? `|${label}` : ""}]]` : m;
  });
  return { text: out, ambiguous };
}

/** Text for the editor: [[id]] shows as the page's current title again. */
export function toEditable(text: string, index: LinkIndex): string {
  return text.replace(LINK, (m, target: string, label?: string) => {
    const p = ID.test(target.trim()) ? index.byId.get(target.trim().toLowerCase()) : null;
    return p ? `[[${p.title}${label ? `|${label}` : ""}]]` : m;
  });
}

/** Ids of the pages a text links to (in this campaign). */
export function linkTargets(text: string, index: LinkIndex): string[] {
  const ids = new Set<string>();
  for (const [, target] of text.matchAll(LINK)) { const p = index.resolve(target); if (p) ids.add(p.id); }
  return [...ids];
}

/* ---------- Parsing for display ---------- */
export type Inline = { kind: "text" | "strong" | "em"; text: string } | { kind: "link"; target: string; label: string; page: LinkPage | null };
export type Block = { kind: "p"; lines: Inline[][] } | { kind: "ul"; items: Inline[][] };

function inline(s: string, index: LinkIndex): Inline[] {
  const out: Inline[] = [];
  const pushText = (t: string) => {
    // **bold** and *italic*, as in the prototype.
    for (const part of t.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)) {
      if (!part) continue;
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) out.push({ kind: "strong", text: part.slice(2, -2) });
      else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) out.push({ kind: "em", text: part.slice(1, -1) });
      else out.push({ kind: "text", text: part });
    }
  };
  let last = 0;
  for (const m of s.matchAll(LINK)) {
    pushText(s.slice(last, m.index));
    const page = index.resolve(m[1]);
    // An id that isn't a page in this campaign shows as plain grey text, never as another campaign's title.
    const label = m[2]?.trim() || page?.title || (ID.test(m[1].trim()) ? "unknown page" : m[1].trim());
    out.push({ kind: "link", target: m[1].trim(), label, page });
    last = m.index + m[0].length;
  }
  pushText(s.slice(last));
  return out;
}

/** Paragraphs split on blank lines; lines starting with "- " become list items. */
export function parseText(text: string, index: LinkIndex): Block[] {
  const blocks: Block[] = [];
  for (const para of text.split(/\n\s*\n/)) {
    let lines: Inline[][] = [], items: Inline[][] = [];
    const flush = () => {
      if (lines.length) blocks.push({ kind: "p", lines });
      if (items.length) blocks.push({ kind: "ul", items });
      lines = []; items = [];
    };
    for (const raw of para.split("\n")) {
      const l = raw.trim();
      if (!l) continue;
      if (l.startsWith("- ")) { if (lines.length) { blocks.push({ kind: "p", lines }); lines = []; } items.push(inline(l.slice(2), index)); }
      else { if (items.length) { blocks.push({ kind: "ul", items }); items = []; } lines.push(inline(l, index)); }
    }
    flush();
  }
  return blocks;
}

/** All the text on a page that can hold links: lead, infobox values and sections. */
export const pageText = (c: { lead: string; info: Record<string, string>; sections: Record<string, string> }) =>
  [c.lead, ...Object.values(c.info), ...Object.values(c.sections)].join("\n");
