import Link from "next/link";
import { parseText, type Inline, type LinkIndex } from "@/lib/links";

function Inlines({ parts, base }: { parts: Inline[]; base: string }) {
  return parts.map((p, i) => {
    if (p.kind !== "link") return p.kind === "strong" ? <strong key={i}>{p.text}</strong> : p.kind === "em" ? <em key={i}>{p.text}</em> : p.text;
    return p.page
      ? <Link key={i} className="wl" href={`${base}/${p.page.id}`}>{p.label}</Link>
      : <span key={i} className="wl un" title="No page with this name yet">{p.label}</span>;
  });
}

/** Page text with wiki links, bold, italic and lists. `inline` renders one line without paragraphs (infobox values). */
export function RichText({ text, index, base, inline = false }: { text: string; index: LinkIndex; base: string; inline?: boolean }) {
  const blocks = parseText(text, index);
  if (inline) return blocks.flatMap((b) => (b.kind === "p" ? b.lines : b.items)).map((l, i) => <span key={i}>{i > 0 && " "}<Inlines parts={l} base={base} /></span>);
  return blocks.map((b, i) => b.kind === "ul"
    ? <ul key={i}>{b.items.map((it, j) => <li key={j}><Inlines parts={it} base={base} /></li>)}</ul>
    : <p key={i}>{b.lines.map((l, j) => <span key={j}>{j > 0 && <br />}<Inlines parts={l} base={base} /></span>)}</p>);
}
