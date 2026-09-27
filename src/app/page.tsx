import type { Metadata } from "next";
import Link from "next/link";
import { listCampaigns, requireGM } from "@/lib/dal";
import { RULESETS } from "@/lib/reference";
import { TopBar } from "@/components/top-bar";
import { NewCampaignForm } from "./new-campaign-form";

export const metadata: Metadata = { title: "Campaigns · Designspace" };

export default async function Home() {
  const gm = await requireGM();
  const campaigns = await listCampaigns();
  return (
    <>
      <TopBar userName={gm.name} />
      <main className="page" id="main">
        <h1 className="display">Campaigns</h1>
        <p className="muted">Each campaign has its own ruleset, references and calendar.</p>
        <div className="home-grid">
          <section aria-labelledby="list-h">
            <h2 id="list-h" className="eyebrow">Your campaigns</h2>
            {campaigns.length === 0 ? (
              <p className="empty">No campaigns yet. Create the first one.</p>
            ) : (
              <ul className="camps">
                {campaigns.map((c) => (
                  <li key={c.id}>
                    <Link className="camp" href={`/c/${c.id}/wiki`}>
                      <span className="camp-name">{c.name}</span>
                      {c.setting && <span className="muted">{c.setting}</span>}
                      <span className="pill">{RULESETS[c.ruleset]?.short ?? c.ruleset}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card stack" aria-labelledby="new-h">
            <h2 id="new-h">New campaign</h2>
            <NewCampaignForm />
          </section>
        </div>
      </main>
    </>
  );
}
