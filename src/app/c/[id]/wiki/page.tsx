import type { Metadata } from "next";
import { getCampaign } from "@/lib/dal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCampaign((await params).id);
  return { title: `Wiki · ${c.name} · Designspace` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCampaign((await params).id);
  return (
    <section className="empty-ws" aria-labelledby="ws-h">
      <h1 id="ws-h" className="display">Wiki</h1>
      <p className="lead">The campaign atlas: every place, person, faction and thread, nested and linked.</p>
      <p className="muted">Arrives in <strong>M1 · Wiki core</strong>. {c.name} is ready for it.</p>
    </section>
  );
}
