import Link from "next/link";
import { ENTRY_TYPES, isAuto, type EntryType } from "@/lib/reference";
import type { PageContent } from "@/lib/validation";

type Page = { id: string; title: string; type: EntryType };
type Version = { number: number; createdAt: Date; changed: string };
type Props = { base: string; pageId: string; type: EntryType; content: PageContent; hasInside: boolean; linksTo: Page[]; linkedFrom: Page[]; versions: Version[] };

/**
 * The right pane of a Wiki page (reference/wiki-page-design.md → Right pane), in the decided order.
 * Parts that arrive with later milestones (proposals, clocks, player notes, timeline, sessions) are not shown yet.
 */
export function ContextPane({ base, pageId, type, content, hasInside, linksTo, linkedFrom, versions }: Props) {
  // "On this page": the sections that have content, grouped as on the page (the read-aloud panel sits above them).
  const toc = ENTRY_TYPES[type].groups.flatMap((g) => g.fields
    .filter((f) => f.key !== "impression" && (f.key === "CHILDREN" ? hasInside : !isAuto(f.key) && content.sections[f.key]))
    .map((f) => ({ ...f, group: g.name })));
  const when = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  return (
    <aside className="ctx" aria-label="Page context">
      {toc.length > 2 && (
        <>
          <h3>On this page</h3>
          <ul className="toc">
            {toc.map((t, i) => (
              <li key={t.key}>
                {(i === 0 || toc[i - 1].group !== t.group) && <span className="toc-g">{t.group}</span>}
                <a href={`#s-${t.key}`}>{t.label}</a>
              </li>
            ))}
          </ul>
        </>
      )}
      <h3>Linked from · {linkedFrom.length}</h3>
      <ul>
        {linkedFrom.map((p) => <li key={p.id}><Link className="wl" href={`${base}/${p.id}`}>{p.title}</Link> <span className="rel">{ENTRY_TYPES[p.type].label}</span></li>)}
        {linkedFrom.length === 0 && <li className="muted">Nothing links here yet</li>}
      </ul>
      {linksTo.length > 0 && (
        <>
          <h3>Links to · {linksTo.length}</h3>
          <ul>{linksTo.map((p) => <li key={p.id}><Link className="wl" href={`${base}/${p.id}`}>{p.title}</Link></li>)}</ul>
        </>
      )}
      <h3>History</h3>
      <ul className="hist">
        {versions.slice(0, 5).map((v) => (
          <li key={v.number}>
            <Link href={`${base}/${pageId}/history/${v.number}`}>Version {v.number}</Link> <span className="mono">{when(v.createdAt)}</span>
            <br /><span className="small">{v.changed}</span>
          </li>
        ))}
      </ul>
      <p className="small"><Link href={`${base}/${pageId}/history`}>Full history</Link></p>
    </aside>
  );
}
