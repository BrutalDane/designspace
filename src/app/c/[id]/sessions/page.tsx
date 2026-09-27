import type { Metadata } from "next";
import { getCampaign } from "@/lib/dal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCampaign((await params).id);
  return { title: `Sessions · ${c.name} · Designspace` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCampaign((await params).id);
  return (
    <section className="empty-ws" aria-labelledby="ws-h">
      <h1 id="ws-h" className="display">Sessions</h1>
      <p className="lead">Prepare sessions, run them at the table, and let the world react afterwards.</p>
      <p className="muted">Arrives in <strong>M2 · Sessions</strong>. {c.name} is ready for it.</p>
    </section>
  );
}
