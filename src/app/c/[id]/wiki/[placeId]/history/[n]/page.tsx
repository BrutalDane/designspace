import type { Metadata } from "next";
import Link from "next/link";
import { getPlace, getVersion, listPlaces } from "@/lib/dal";
import { ancestors } from "@/lib/tree";
import { PlaceDocument } from "@/components/place-document";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { restoreVersion } from "../../../actions";

type Props = { params: Promise<{ id: string; placeId: string; n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, placeId, n } = await params;
  return { title: `Version ${Number(n)} of ${(await getPlace(id, placeId)).current.title} · Designspace` };
}

export default async function Page({ params }: Props) {
  const { id, placeId, n } = await params;
  const [p, places, v] = await Promise.all([getPlace(id, placeId), listPlaces(id), getVersion(id, placeId, Number(n))]);
  const base = `/c/${id}/wiki/${p.id}`;
  const isCurrent = v.number === p.current.number;
  return (
    <article aria-labelledby="ver-h">
      <Breadcrumbs base={`/c/${id}/wiki`} path={[...ancestors(places, p.id), { id: p.id, title: p.current.title }]} current={`Version ${v.number}`} />
      <p className="eyebrow">Version {v.number} · {v.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
      <h1 id="ver-h" className="display">{v.title}</h1>
      <div className="notice stack">
        {isCurrent ? <p>This is the current version.</p> : (
          <>
            <p>You are reading an older version. The page is now at version {p.current.number}.</p>
            <form action={restoreVersion.bind(null, id, p.id, v.number)} className="actions">
              <button className="btn primary" type="submit">Restore this version</button>
              <Link className="btn ghost" href={`${base}/history`}>Back to history</Link>
            </form>
            <p className="small muted">Restoring saves a copy of this version as the newest one. Nothing in the history is lost.</p>
          </>
        )}
      </div>
      <PlaceDocument type={p.type} content={v} />
    </article>
  );
}
