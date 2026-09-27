import { PLACE_TYPES, type PlaceType } from "@/lib/reference";
import type { PageContent } from "@/lib/validation";

/** Plain text with blank lines between paragraphs. */
function Prose({ text }: { text: string }) {
  return <div className="prose">{text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</div>;
}

/** The written part of a place page. Sections that are empty are not shown. */
export function PlaceDocument({ type, content, whenEmpty }: { type: PlaceType; content: PageContent; whenEmpty?: React.ReactNode }) {
  const sections = PLACE_TYPES[type].sections.filter((s) => content.sections[s.key]);
  if (!content.summary && sections.length === 0) return <div className="empty">{whenEmpty ?? "Nothing written yet."}</div>;
  return (
    <div className="doc">
      {content.summary && <div className="lead"><Prose text={content.summary} /></div>}
      {sections.map((s) => (
        <section key={s.key} aria-labelledby={`sec-${s.key}`}>
          <h2 id={`sec-${s.key}`}>{s.heading}</h2>
          <Prose text={content.sections[s.key]} />
        </section>
      ))}
    </div>
  );
}
