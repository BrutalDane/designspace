import type { Metadata } from "next";
import Link from "next/link";
import { getCampaign, listPages } from "@/lib/dal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCampaign((await params).id);
  return { title: `Wiki · ${c.name} · Designspace` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pages = await listPages(id);
  return (
    <section aria-labelledby="ws-h" className="stack">
      <h1 id="ws-h" className="display">Wiki</h1>
      {pages.length === 0 ? (
        <>
          <p className="lead">The campaign atlas. Start with the world or plane the campaign lives in.</p>
          <p><Link className="btn primary" href={`/c/${id}/wiki/new`}>New page</Link></p>
        </>
      ) : (
        <>
          <p className="lead">Pick a page from the tree.</p>
          <p><Link className="btn" href={`/c/${id}/wiki/new`}>New page</Link></p>
        </>
      )}
    </section>
  );
}
