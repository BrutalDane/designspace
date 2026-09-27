import Link from "next/link";
import { INFOBOX_IMAGE, PLACE_TYPES, infoFields, isAuto, type PlaceType } from "@/lib/reference";
import type { PageContent } from "@/lib/validation";
import type { LinkIndex } from "@/lib/links";
import { RichText } from "./rich-text";

type Near = { id: string; title: string; type: PlaceType; lead: string };
type Props = {
  type: PlaceType;
  content: PageContent;
  base: string;          // e.g. /c/<id>/wiki
  index: LinkIndex;      // resolves [[links]] to pages in this campaign
  parent?: Near | null;  // shown in the infobox
  inside?: Near[];       // the automatic "Contains" list
};

const firstSentence = (lead: string) => (lead ? `${lead.split(". ")[0].replace(/\.$/, "")}.` : "");

function Children({ base, inside, index }: { base: string; inside: Near[]; index: LinkIndex }) {
  return (
    <ul className="poi">
      {inside.map((c) => (
        <li key={c.id}>
          <Link href={`${base}/${c.id}`}>{c.title}</Link>
          <span className="muted small">{PLACE_TYPES[c.type].label}</span>
          {c.lead && <span className="poi-lead"><RichText text={firstSentence(c.lead)} index={index} base={base} inline /></span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * A place page as decided in reference/wiki-page-design.md: lead, read-aloud first impression, grouped sections with
 * the "At the table" GM group, quiet "Not written yet" lines instead of empty boxes, automatic lists, and the infobox.
 */
export function PlaceArticle({ type, content, base, index, parent = null, inside = [] }: Props) {
  const T = PLACE_TYPES[type];
  const impression = content.sections.impression;
  const hasChildrenField = T.groups.some((g) => g.fields.some((f) => f.key === "CHILDREN"));

  const groups = T.groups.map((g) => {
    const parts: React.ReactNode[] = [];
    const empty: string[] = [];
    for (const f of g.fields) {
      if (f.key === "impression") continue; // shown as the read-aloud panel at the top
      const body = f.key === "CHILDREN" ? (inside.length ? <Children base={base} inside={inside} index={index} /> : null)
        : isAuto(f.key) ? null // People here and similar arrive with the types that fill them
        : content.sections[f.key] ? <RichText text={content.sections[f.key]} index={index} base={base} /> : null;
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
        {content.lead && <div className="lead"><RichText text={content.lead} index={index} base={base} /></div>}
        {impression && <div className="impression"><div className="eyebrow">Read aloud</div><RichText text={impression} index={index} base={base} /></div>}
        {groups}
        {!hasChildrenField && inside.length > 0 && (
          <div className="grp-block">
            <div className="grp-h"><span>{T.kids}</span></div>
            <section className="sec" aria-label={T.kids}><Children base={base} inside={inside} index={index} /></section>
          </div>
        )}
      </div>
      <Infobox type={type} content={content} base={base} index={index} parent={parent} inside={inside} />
    </div>
  );
}

function Infobox({ type, content, base, index, parent, inside }: Required<Omit<Props, "parent">> & { parent: Near | null }) {
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
            <div key={k}><dt>{k}</dt><dd>{k === "Parent" && parent ? <Link href={`${base}/${parent.id}`}>{parent.title}</Link> : <RichText text={content.info[k]} index={index} base={base} inline />}</dd></div>
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
