import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlace } from "@/lib/dal";
import { childTypes } from "@/lib/reference";
import { createPlace } from "../actions";
import { NewPlaceForm } from "./new-place-form";

export const metadata: Metadata = { title: "New place · Designspace" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ parent?: string }> }) {
  const { id } = await params;
  const { parent: parentId } = await searchParams;
  const parent = parentId ? await getPlace(id, parentId) : null;
  const kinds = childTypes(parent?.type ?? null);
  if (kinds.length === 0) notFound();
  return (
    <section aria-labelledby="new-h" className="stack narrow-form">
      <h1 id="new-h" className="display">New place</h1>
      <p className="muted">Where it goes: {parent ? <strong>{parent.current.title}</strong> : "the top of the Wiki"}.</p>
      <NewPlaceForm action={createPlace.bind(null, id, parent?.id ?? null)} kinds={kinds} cancelHref={parent ? `/c/${id}/wiki/${parent.id}` : `/c/${id}/wiki`} />
    </section>
  );
}
