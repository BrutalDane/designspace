import type { Metadata } from "next";
import { getCampaign } from "@/lib/dal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCampaign((await params).id);
  return { title: `Worldbuilding · ${c.name} · Designspace` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const c = await getCampaign((await params).id);
  return (
    <section className="empty-ws" aria-labelledby="ws-h">
      <h1 id="ws-h" className="display">Worldbuilding</h1>
      <p className="lead">Think with the co-GM, one entry type at a time. Nothing reaches the Wiki until you accept it.</p>
      <p className="muted">Arrives in <strong>M4 · Co-GM</strong>. {c.name} is ready for it.</p>
    </section>
  );
}
