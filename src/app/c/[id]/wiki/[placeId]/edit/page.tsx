import type { Metadata } from "next";
import { getPlace, listPlaces } from "@/lib/dal";
import { PLACE_TYPES } from "@/lib/reference";
import { ancestors } from "@/lib/tree";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { savePlace } from "../../actions";
import { EditPlaceForm } from "./edit-place-form";

type Props = { params: Promise<{ id: string; placeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, placeId } = await params;
  return { title: `Editing ${(await getPlace(id, placeId)).current.title} · Designspace` };
}

export default async function Page({ params }: Props) {
  const { id, placeId } = await params;
  const [p, places] = await Promise.all([getPlace(id, placeId), listPlaces(id)]);
  const base = `/c/${id}/wiki`;
  return (
    <section aria-labelledby="edit-h">
      <Breadcrumbs base={base} path={[...ancestors(places, p.id), { id: p.id, title: p.current.title }]} current="Edit" />
      <h1 id="edit-h" className="display">Edit {p.current.title}</h1>
      <p className="muted">Write only what helps you run the game. Empty sections don&apos;t show on the page.</p>
      <EditPlaceForm
        action={savePlace.bind(null, id, p.id, p.current.number)}
        sections={PLACE_TYPES[p.type].sections}
        initial={p.current}
        cancelHref={`${base}/${p.id}`}
      />
    </section>
  );
}
