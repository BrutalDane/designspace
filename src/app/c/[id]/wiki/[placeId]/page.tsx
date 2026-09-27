import type { Metadata } from "next";
import Link from "next/link";
import { getCampaign, getPlace, listPlaces, listVersions, placeLinks } from "@/lib/dal";
import { PLACE_TYPES, childTypes } from "@/lib/reference";
import { ancestors } from "@/lib/tree";
import { linkIndex } from "@/lib/links";
import { changedParts } from "@/lib/validation";
import { PlaceArticle } from "@/components/place-article";
import { ContextPane } from "@/components/context-pane";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Props = { params: Promise<{ id: string; placeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, placeId } = await params;
  const [c, p] = await Promise.all([getCampaign(id), getPlace(id, placeId)]);
  return { title: `${p.current.title} · ${c.name} · Designspace` };
}

export default async function Page({ params }: Props) {
  const { id, placeId } = await params;
  const [p, places, links, versions] = await Promise.all([getPlace(id, placeId), listPlaces(id), placeLinks(id, placeId), listVersions(id, placeId)]);
  const base = `/c/${id}/wiki`;
  const inside = places.filter((x) => x.parentId === p.id).sort((a, b) => a.title.localeCompare(b.title));
  const parent = places.find((x) => x.id === p.parentId) ?? null;
  return (
    <div className="place-layout">
      <article aria-labelledby="place-h">
        <Breadcrumbs base={base} path={ancestors(places, p.id)} current={p.current.title} />
        <h1 id="place-h" className="display">{p.current.title}</h1>
        <div className="docbar">
          <span className="pill p-draft">{PLACE_TYPES[p.type].label}</span>
          <span className="spacer" />
          <Link className="btn" href={`${base}/${p.id}/edit`}>Edit</Link>
        </div>
        <PlaceArticle type={p.type} content={p.current} base={base} index={linkIndex(places)} parent={parent} inside={inside} />
        {childTypes(p.type).length > 0 && (
          <p className="add-inside"><Link className="btn small" href={`${base}/new?parent=${p.id}`}>Add a place inside {p.current.title}</Link></p>
        )}
      </article>
      <ContextPane
        base={base} placeId={p.id} type={p.type} content={p.current} hasInside={inside.length > 0}
        linksTo={links.linksTo} linkedFrom={links.linkedFrom}
        versions={versions.map(({ version: v }, i) => ({ number: v.number, createdAt: v.createdAt, changed: changedParts(p.type, versions[i + 1]?.version, v).join(", ") }))}
      />
    </div>
  );
}
