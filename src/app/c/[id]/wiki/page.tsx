import type { Metadata } from "next";
import Link from "next/link";
import { getCampaign, listPlaces } from "@/lib/dal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCampaign((await params).id);
  return { title: `Wiki · ${c.name} · Designspace` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const places = await listPlaces(id);
  return (
    <section aria-labelledby="ws-h" className="stack">
      <h1 id="ws-h" className="display">Wiki</h1>
      {places.length === 0 ? (
        <>
          <p className="lead">The campaign atlas. Start with the place your campaign happens in: a whole world, a region, or a single town.</p>
          <p><Link className="btn primary" href={`/c/${id}/wiki/new`}>Add the first place</Link></p>
        </>
      ) : (
        <>
          <p className="lead">Pick a place from the tree, or add a new place at the top level.</p>
          <p><Link className="btn" href={`/c/${id}/wiki/new`}>Add a top-level place</Link></p>
        </>
      )}
    </section>
  );
}
