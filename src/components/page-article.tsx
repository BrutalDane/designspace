import Link from "next/link";
import { INFOBOX_IMAGE, ENTRY_TYPES, infoFields, isAuto, type EntryType } from "@/lib/reference";
import type { PageContent } from "@/lib/validation";
import type { LinkIndex } from "@/lib/links";
import { RichText } from "./rich-text";

export type Near = { id: string; title: string; type: EntryType; lead: string; info: Record<string, string> };
/** The lists that build themselves for this page (reference/wiki-page-design.md → Automatic lists). */
export type AutoLists = { inside: Near[]; people: Near[]; members: Near[]; carries: Near[]; party: Near[] };
type Props = {
  type: EntryType;
  content: PageContent;
  base: string;          // e.g. /c/<id>/wiki
  index: LinkIndex;      // resolves [[links]] to pages in this campaign
  parent?: Near | null;  // shown in the infobox
  lists?: AutoLists;     // left out when showing an older version
};

const NONE: AutoLists = { inside: [], people: [], members: [], carries: [], party: [] };
const firstSentence = (lead: string) => (lead ? `${lead.split(". ")[0].replace(/\.$/, "")}.` : "");
/** Initials for the round badge, as in the prototype. */
export const monogram = (t: string) => t.replace(/^(The|Lady|Captain|Lord)\s+/, "").split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();

function Children({ base, inside, index }: { base: string; inside: Near[]; index: LinkIndex }) {
  return (
    <ul className="poi">
      {inside.map((c) => (
        <li key={c.id}>
          <Link href={`${base}/${c.id}`}>{c.title}</Link>
          <span className="muted small">{ENTRY_TYPES[c.type].label}{c.info.Type ? ` · ${c.info.Type}` : ""}</span>
          {c.lead && <span className="poi-lead"><RichText text={firstSentence(c.lead)} index={index} base={base} inline /></span>}
        </li>
      ))}
    </ul>
  );
}

function People({ base, people, index }: { base: string; people: Near[]; index: LinkIndex }) {
  return (
    <ul className="people">
      {people.map((p) => (
        <li key={p.id}>
          <span className={`mono-badge sm${p.type === "pc" ? " pc" : ""}`} aria-hidden="true">{monogram(p.title)}</span>
          <span>
            <Link href={`${base}/${p.id}`}>{p.title}</Link><br />
            <span className="muted small">
              {p.type === "pc" ? `${p.info["Class and level"] ?? ""}${p.info.Player ? ` · played by ${p.info.Player}` : ""}` : <RichText text={p.info.Role ?? ""} index={index} base={base} inline />}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Items({ base, items }: { base: string; items: Near[] }) {
  return <ul>{items.map((i) => <li key={i.id}><Link href={`${base}/${i.id}`}>{i.title}</Link>{i.info.Rarity && <span className="muted small"> · {i.info.Rarity}</span>}</li>)}</ul>;
}

/**
 * A Wiki page as decided in reference/wiki-page-design.md: lead, the family's own elements (read-aloud, triad and voice,
 * public face and hidden truth, item pills), grouped sections with the "At the table" GM group, quiet "Not written yet"
 * lines instead of empty boxes, automatic lists, and the infobox.
 */
export function PageArticle({ type, content, base, index, parent = null, lists = NONE }: Props) {
  const T = ENTRY_TYPES[type];
  const text = (k: string) => content.sections[k];
  const rich = (k: string) => <RichText text={text(k)} index={index} base={base} />;
  const notSet = <span className="muted">Not set</span>;
  const hasChildrenField = T.groups.some((g) => g.fields.some((f) => f.key === "CHILDREN"));

  const autoBody = (key: string) => {
    if (key === "CHILDREN") return lists.inside.length ? <Children base={base} inside={lists.inside} index={index} /> : null;
    if (key === "PEOPLE") return lists.people.length ? <People base={base} people={lists.people} index={index} /> : null;
    if (key === "MEMBERS") return lists.members.length ? <People base={base} people={lists.members} index={index} /> : null;
    if (key === "CARRIES") return lists.carries.length ? <Items base={base} items={lists.carries} /> : null;
    return null; // Keyed areas arrive with Dungeon level
  };

  // The family's own elements, between the lead and the groups (as in the prototype).
  let family: React.ReactNode = null;
  if (T.fam === "place" && text("impression")) {
    family = <div className="impression"><div className="eyebrow">Read aloud</div>{rich("impression")}</div>;
  } else if (T.fam === "person") {
    const [triad, voice] = [T.extra!.slice(0, 3), T.extra![3]];
    family = (
      <>
        <div className="triad">{triad.map((f) => <div key={f.key} className={`tri ${f.key}`}><div className="eyebrow">{f.label}</div>{text(f.key) ? rich(f.key) : notSet}</div>)}</div>
        {text(voice.key) && <blockquote className="voice"><span className="eyebrow">Voice</span>{text(voice.key)}</blockquote>}
      </>
    );
  } else if (T.fam === "faction") {
    const cell = (k: string, label: string, hid = false) => <div className={hid ? "hid" : undefined}><div className="eyebrow">{label}</div>{text(k) ? rich(k) : notSet}</div>;
    family = (
      <>
        <div className="split">{cell("public", "Public face")}{cell("hidden", "Hidden truth · GM", true)}</div>
        <div className="split">{cell("willdo", "Will absolutely do")}{cell("wont", "Won't do")}</div>
      </>
    );
  } else if (T.fam === "item") {
    family = (
      <div className="item-top">
        <span className="pill p-working">{content.info.Rarity || "Rarity not set"}</span>
        <span className="pill p-draft">{content.info.Kind || "Kind not set"}</span>
        <span className="pill p-draft">Attunement: {content.info.Attunement || "not set"}</span>
      </div>
    );
  } else if (T.fam === "party") {
    family = <section className="sec" aria-labelledby="s-members"><h2 id="s-members">Members</h2>{lists.party.length ? <People base={base} people={lists.party} index={index} /> : <p className="muted">No player characters yet.</p>}</section>;
  }

  const groups = T.groups.map((g) => {
    const parts: React.ReactNode[] = [];
    const empty: string[] = [];
    for (const f of g.fields) {
      if (T.fam === "place" && f.key === "impression") continue; // shown as the read-aloud panel
      const body = isAuto(f.key) ? autoBody(f.key)
        : text(f.key) ? (T.fam === "item" && f.key === "effects" ? <div className="mech">{rich(f.key)}</div> : rich(f.key)) : null;
      if (body) parts.push(<section className="sec" key={f.key} aria-labelledby={`s-${f.key}`}><h2 id={`s-${f.key}`}>{f.label}</h2>{body}</section>);
      else if (!isAuto(f.key)) empty.push(f.label);
    }
    const gmPill = (label: string) => g.gm && <span className="pill p-hot">{label}</span>;
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
        {family}
        {groups}
        {!hasChildrenField && T.kids && lists.inside.length > 0 && (
          <div className="grp-block">
            <div className="grp-h"><span>{T.kids}</span></div>
            <section className="sec" aria-label={T.kids}><Children base={base} inside={lists.inside} index={index} /></section>
          </div>
        )}
      </div>
      <Infobox type={type} content={content} base={base} index={index} parent={parent} inside={lists.inside} />
    </div>
  );
}

function Infobox({ type, content, base, index, parent, inside }: { type: EntryType; content: PageContent; base: string; index: LinkIndex; parent: Near | null; inside: Near[] }) {
  const isItem = type === "item"; // an item's facts are its pills, as in the prototype
  const rows = isItem ? [] : ENTRY_TYPES[type].info.filter((k) => (k === "Parent" ? parent : content.info[k]));
  const missing = isItem ? [] : infoFields(type).filter((k) => !content.info[k]);
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
