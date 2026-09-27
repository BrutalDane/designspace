import type { Metadata } from "next";
import { getPlace, listPlaces, validParents } from "@/lib/dal";
import { PLACE_TYPES, infoFields, writtenFields } from "@/lib/reference";
import { ancestors } from "@/lib/tree";
import { linkIndex, toEditable } from "@/lib/links";
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
  const [p, places, parents] = await Promise.all([getPlace(id, placeId), listPlaces(id), validParents(id, placeId)]);
  const base = `/c/${id}/wiki`;
  const T = PLACE_TYPES[p.type];
  // Saved links hold page ids; the editor shows them as [[Title]] again.
  const index = linkIndex(places), ed = (t: string) => toEditable(t, index);
  const editable = {
    title: p.current.title, lead: ed(p.current.lead),
    info: Object.fromEntries(Object.entries(p.current.info).map(([k, v]) => [k, ed(v)])),
    sections: Object.fromEntries(Object.entries(p.current.sections).map(([k, v]) => [k, ed(v)])),
  };
  const label = (x: { title: string; type: keyof typeof PLACE_TYPES }) => `${x.title} · ${PLACE_TYPES[x.type].label}`;
  // A page placed before the nesting rules were fixed keeps its current parent until the GM picks a valid one.
  const current = places.find((x) => x.id === p.parentId);
  const parentOptions = [
    ...(current && !parents.some((x) => x.id === current.id) ? [{ id: current.id, label: `${label(current)} (current, not an allowed parent)` }] : []),
    ...parents.map((x) => ({ id: x.id, label: label(x) })),
  ];
  return (
    <section aria-labelledby="edit-h">
      <Breadcrumbs base={base} path={[...ancestors(places, p.id), { id: p.id, title: p.current.title }]} current="Edit" />
      <p className="eyebrow">Editing directly · {T.label} layout</p>
      <h1 id="edit-h" className="display">{p.current.title}</h1>
      <p className="notice">You are the GM, so direct edits become canon when you save.</p>
      <EditPlaceForm
        action={savePlace.bind(null, id, p.id, p.current.number)}
        initial={editable}
        parent={T.parents.length > 0 ? {
          current: p.parentId ?? "",
          options: parentOptions,
          hint: `A ${T.label.toLowerCase()} can sit under: ${T.parents.map((t) => PLACE_TYPES[t].label).join(", ")}`,
        } : null}
        info={infoFields(p.type)}
        sections={writtenFields(p.type)}
        cancelHref={`${base}/${p.id}`}
      />
    </section>
  );
}
