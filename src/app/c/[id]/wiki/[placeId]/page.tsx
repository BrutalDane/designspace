import type { Metadata } from "next";
import Link from "next/link";
import { getCampaign, getPlace, listPlaces } from "@/lib/dal";
import { PLACE_TYPES, childTypes } from "@/lib/reference";
import { ancestors } from "@/lib/tree";
import { PlaceDocument } from "@/components/place-document";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Props = { params: Promise<{ id: string; placeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, placeId } = await params;
  const [c, p] = await Promise.all([getCampaign(id), getPlace(id, placeId)]);
  return { title: `${p.current.title} · ${c.name} · Designspace` };
}

export default async function Page({ params }: Props) {
  const { id, placeId } = await params;
  const [p, places] = await Promise.all([getPlace(id, placeId), listPlaces(id)]);
  const base = `/c/${id}/wiki`;
  const title = p.current.title;
  const inside = places.filter((x) => x.parentId === p.id).sort((a, b) => a.title.localeCompare(b.title));
  const canAdd = childTypes(p.type).length > 0;
  return (
    <article aria-labelledby="place-h">
      <Breadcrumbs base={base} path={ancestors(places, p.id)} current={title} />
      <header className="place-head">
        <span className="pill">{PLACE_TYPES[p.type].label}</span>
        <h1 id="place-h" className="display">{title}</h1>
        <div className="actions">
          <Link className="btn" href={`${base}/${p.id}/edit`}>Edit page</Link>
          <Link className="btn ghost" href={`${base}/${p.id}/history`}>History</Link>
        </div>
      </header>
      <PlaceDocument type={p.type} content={p.current}
        whenEmpty={<>Nothing written yet. <Link href={`${base}/${p.id}/edit`}>Edit the page</Link> to start; its sections suggest what to cover.</>} />
      {(inside.length > 0 || canAdd) && (
        <section className="inside" aria-labelledby="inside-h">
          <h2 id="inside-h">Inside {title}</h2>
          {inside.length > 0 && (
            <ul>
              {inside.map((c) => <li key={c.id}><Link href={`${base}/${c.id}`}>{c.title}</Link> <span className="muted small">{PLACE_TYPES[c.type].label}</span></li>)}
            </ul>
          )}
          {canAdd && <p><Link className="btn small" href={`${base}/new?parent=${p.id}`}>Add a place inside {title}</Link></p>}
        </section>
      )}
      <p className="muted small meta">Version {p.current.number} · saved {p.current.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
    </article>
  );
}
