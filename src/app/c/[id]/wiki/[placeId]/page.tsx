import type { Metadata } from "next";
import Link from "next/link";
import { getCampaign, getPlace, listPlaces } from "@/lib/dal";
import { PLACE_TYPES, childTypes } from "@/lib/reference";
import { ancestors } from "@/lib/tree";
import { PlaceArticle } from "@/components/place-article";
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
  const inside = places.filter((x) => x.parentId === p.id).sort((a, b) => a.title.localeCompare(b.title));
  const parent = places.find((x) => x.id === p.parentId) ?? null;
  return (
    <article aria-labelledby="place-h">
      <Breadcrumbs base={base} path={ancestors(places, p.id)} current={p.current.title} />
      <h1 id="place-h" className="display">{p.current.title}</h1>
      <div className="docbar">
        <span className="pill p-draft">{PLACE_TYPES[p.type].label}</span>
        <span className="spacer" />
        <Link className="btn ghost" href={`${base}/${p.id}/history`}>History</Link>
        <Link className="btn" href={`${base}/${p.id}/edit`}>Edit</Link>
      </div>
      <PlaceArticle type={p.type} content={p.current} base={base} parent={parent} inside={inside} />
      {childTypes(p.type).length > 0 && (
        <p className="add-inside"><Link className="btn small" href={`${base}/new?parent=${p.id}`}>Add a place inside {p.current.title}</Link></p>
      )}
      <p className="muted small meta">Version {p.current.number} · saved {p.current.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
    </article>
  );
}
