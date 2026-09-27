import type { Metadata } from "next";
import Link from "next/link";
import { getCampaign, listPages, listPageTexts } from "@/lib/dal";
import { RULESETS } from "@/lib/reference";
import { CLOCK_SEGMENTS } from "@/lib/page-data";
import { linkIndex } from "@/lib/links";
import { RichText } from "@/components/rich-text";
import { Clock } from "@/components/clock";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCampaign((await params).id);
  return { title: `Campaign State · ${c.name} · Designspace` };
}

/**
 * Campaign State: the Wiki's front page and a dashboard, not an article (reference/wiki-page-design.md). Fronts and
 * clocks come from threads; "Recent events" arrives with the timeline in Sessions.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [c, pages, texts] = await Promise.all([getCampaign(id), listPages(id), listPageTexts(id)]);
  const base = `/c/${id}/wiki`;
  const index = linkIndex(pages);
  const rich = (t: string) => <RichText text={t} index={index} base={base} inline />;
  const nextBeat = new Map(texts.map((t) => [t.id, t.sections.next ?? ""]));
  const threads = pages.filter((p) => p.type === "thread").sort((a, b) => a.title.localeCompare(b.title));
  const withClock = threads.filter((t) => t.data.clock);
  const others = threads.filter((t) => !t.data.clock);
  return (
    <section aria-labelledby="ws-h">
      <h1 id="ws-h" className="display">Campaign State</h1>
      <div className="docbar">
        <span className="pill p-prepared">{RULESETS[c.ruleset]?.short ?? c.ruleset}</span>
        <span className="spacer" />
        <Link className="btn" href={`${base}/new`}>New page</Link>
      </div>
      {withClock.length > 0 && (
        <section className="sec" aria-labelledby="cs-fronts">
          <h2 id="cs-fronts">Fronts and clocks</h2>
          <div className="cs-clocks">
            {withClock.map((t) => (
              <div className="cs-clock" key={t.id}>
                <div><b><Link className="wl" href={`${base}/${t.id}`}>{t.title}</Link></b>{t.info["Driven by"] && <small>{rich(t.info["Driven by"])}</small>}</div>
                <div><Clock pos={t.data.clock!.pos} /> <span className="mono">{t.data.clock!.pos}/{CLOCK_SEGMENTS}</span></div>
                <div><small>Next</small>{t.data.clock!.portent || <span className="muted">Not set</span>}</div>
              </div>
            ))}
          </div>
        </section>
      )}
      {others.length > 0 && (
        <section className="sec" aria-labelledby="cs-open">
          <h2 id="cs-open">Other open threads</h2>
          <div className="tablewrap">
            <table>
              <thead><tr><th scope="col">Thread</th><th scope="col">Pressure</th><th scope="col">Next beat</th></tr></thead>
              <tbody>
                {others.map((t) => (
                  <tr key={t.id}>
                    <td><Link className="wl" href={`${base}/${t.id}`}>{t.title}</Link></td>
                    <td>{t.info.Pressure && <span className="pill p-draft">{t.info.Pressure}</span>}</td>
                    <td>{rich(nextBeat.get(t.id) ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {threads.length === 0 && (
        <div className="card empty-state">
          <p>{pages.length === 0 ? "This campaign is empty. Start in Worldbuilding: pick what you're making." : "No threads yet. Fronts and their clocks show here once there are threads."}</p>
          <p><Link className="btn primary" href={`/c/${id}/build`}>Go to Worldbuilding</Link></p>
        </div>
      )}
    </section>
  );
}
