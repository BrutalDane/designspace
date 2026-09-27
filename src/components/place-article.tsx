import Link from "next/link";
import { INFOBOX_IMAGE, PLACE_TYPES, infoFields, isAuto, type PlaceType } from "@/lib/reference";
import type { PageContent } from "@/lib/validation";

/** Plain text with blank lines between paragraphs. */
function Prose({ text }: { text: string }) {
  return <>{text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</>;
}

type Near = { id: string; title: string; type: PlaceType; lead: string };
type Props = {
  type: PlaceType;
  content: PageContent;
  base: string;          // e.g. /c/<id>/wiki
  parent?: Near | null;  // shown in the infobox
  inside?: Near[];       // the automatic "Contains" list
};

const firstSentence = (lead: string) => (lead ? `${lead.split(". ")[0].replace(/\.$/, "")}.` : "");

function Children({ base, inside }: { base: string; inside: Near[] }) {
  return (
    <ul className="poi">
      {inside.map((c) => (
        <li key={c.id}>
          <Link href={`${base}/${c.id}`}>{c.title}</Link>
          <span className="muted small">{PLACE_TYPES[c.type].label}</span>
          {c.lead && <span className="poi-lead">{firstSentence(c.lead)}</span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * A place page as decided in reference/wiki-page-design.md: lead, read-aloud first impression, grouped sections with
 * the "At the table" GM group, quiet "Not written yet" lines instead of empty boxes, automatic lists, and the infobox.
 */
export function PlaceArticle({ type, content, base, parent = null, inside = [] }: Props) {
  const T = PLACE_TYPES[type];
  const impression = content.sections.impression;
  const hasChildrenField = T.groups.some((g) => g.fields.some((f) => f.key === "CHILDREN"));

  const groups = T.groups.map((g) => {
    const parts: React.ReactNode[] = [];
    const empty: string[] = [];
    for (const f of g.fields) {
      if (f.key === "impression") continue; // shown as the read-aloud panel at the top
      const body = f.key === "CHILDREN" ? (inside.length ? <Children base={base} inside={inside} /> : null)
        : isAuto(f.key) ? null // People here and similar arrive with the types that fill them
        : content.sections[f.key] ? <Prose text={content.sections[f.key]} /> : null;
      if (body) parts.push(<section className="sec" key={f.key} aria-labelledby={`s-${f.key}`}><h2 id={`s-${f.key}`}>{f.label}</h2>{body}</section>);
      else if (!isAuto(f.key)) empty.push(f.label);
    }
    const gmPill = (text: string) => g.gm && <span className="pill p-hot">{text}</span>;
    if (!parts.length) {
      return empty.length ? <div className="grp-empty" key={g.name}><strong>{g.name}</strong>{gmPill("GM")} <span>not written yet: {empty.join(", ")}</span></div> : null;
    }
    return (
      <div className={`grp-block${g.gm ? " gm" : ""}`} key={g.name}>
        <div className="grp-h"><span>{g.name}</span>{gmPill("GM only")}</div>
        {parts}
        {empty.length > 0 && <p className="empty-note">Not written yet: {empty.join(", ")}</p>}
      </div>
    );
  });

  return (
    <div className="article">
      <div className="art-main">
        {content.lead && <div className="lead"><Prose text={content.lead} /></div>}
        {impression && <div className="impression"><div className="eyebrow">Read aloud</div><Prose text={impression} /></div>}
        {groups}
        {!hasChildrenField && inside.length > 0 && (
          <div className="grp-block">
            <div className="grp-h"><span>{T.kids}</span></div>
            <section className="sec" aria-label={T.kids}><Children base={base} inside={inside} /></section>
          </div>
        )}
      </div>
      <Infobox type={type} content={content} base={base} parent={parent} inside={inside} />
    </div>
  );
}

function Infobox({ type, content, base, parent, inside }: Required<Omit<Props, "parent">> & { parent: Near | null }) {
  const rows = PLACE_TYPES[type].info.filter((k) => (k === "Parent" ? parent : content.info[k]));
  const missing = infoFields(type).filter((k) => !content.info[k]);
  if (!rows.length && !INFOBOX_IMAGE[type]) return null;
  return (
    <aside className="infobox" aria-label="Infobox">
      <div className="ib-img" aria-hidden="true"><span>{INFOBOX_IMAGE[type] ?? "Image"}</span></div>
      <div className="ib-title">{content.title}</div>
      {(rows.length > 0 || inside.length > 0) && (
        <dl>
          {rows.map((k) => (
            <div key={k}><dt>{k}</dt><dd>{k === "Parent" && parent ? <Link href={`${base}/${parent.id}`}>{parent.title}</Link> : content.info[k]}</dd></div>
          ))}
          {inside.length > 0 && (
            <div className="ib-sub"><dt>Contains</dt><dd>{inside.map((c, i) => <span key={c.id}>{i > 0 && ", "}<Link href={`${base}/${c.id}`}>{c.title}</Link></span>)}</dd></div>
          )}
        </dl>
      )}
      {missing.length > 0 && <div className="ib-missing">Empty: {missing.join(", ")}</div>}
    </aside>
  );
}
