import type { Metadata } from "next";
import { getPage, listPages, validParents } from "@/lib/dal";
import { ENTRY_TYPES, REF_FIELDS, infoFields, writtenFields, type EntryType } from "@/lib/reference";
import { ancestors } from "@/lib/tree";
import { linkIndex, toEditable } from "@/lib/links";
import { refId } from "@/lib/auto-lists";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { savePage } from "../../actions";
import { EditPageForm } from "./edit-page-form";

type Props = { params: Promise<{ id: string; pageId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, pageId } = await params;
  return { title: `Editing ${(await getPage(id, pageId)).current.title} · Designspace` };
}

export default async function Page({ params }: Props) {
  const { id, pageId } = await params;
  const [p, pages, parents] = await Promise.all([getPage(id, pageId), listPages(id), validParents(id, pageId)]);
  const base = `/c/${id}/wiki`;
  const T = ENTRY_TYPES[p.type];
  const label = (x: { title: string; type: EntryType }) => `${x.title} · ${ENTRY_TYPES[x.type].label}`;
  const byTitle = <X extends { title: string }>(xs: X[]) => [...xs].sort((a, b) => a.title.localeCompare(b.title));

  // Saved links hold page ids; the editor shows them as [[Title]] again. Reference fields show as a choice of pages.
  const index = linkIndex(pages), ed = (t: string) => toEditable(t, index);
  const editable = {
    title: p.current.title, lead: ed(p.current.lead),
    info: Object.fromEntries(Object.entries(p.current.info).map(([k, v]) => [k, REF_FIELDS[k] ? refId(v) ?? "" : ed(v)])),
    sections: Object.fromEntries(Object.entries(p.current.sections).map(([k, v]) => [k, ed(v)])),
  };
  const choices = Object.fromEntries(infoFields(p.type).filter((k) => REF_FIELDS[k]).map((k) => [
    k, byTitle(pages.filter((x) => REF_FIELDS[k].includes(x.type) && x.id !== p.id)).map((x) => ({ id: x.id, label: label(x) })),
  ]));

  // A page placed before the nesting rules were fixed keeps its current parent until the GM picks a valid one.
  const current = pages.find((x) => x.id === p.parentId);
  const parentOptions = [
    ...(T.root ? [{ id: "", label: "None (top level)" }] : []),
    ...(current && !parents.some((x) => x.id === current.id) ? [{ id: current.id, label: `${label(current)} (current, not an allowed parent)` }] : []),
    ...parents.map((x) => ({ id: x.id, label: label(x) })),
  ];
  return (
    <section aria-labelledby="edit-h">
      <Breadcrumbs base={base} path={[...ancestors(pages, p.id), { id: p.id, title: p.current.title }]} current="Edit" />
      <p className="eyebrow">Editing directly · {T.label} layout</p>
      <h1 id="edit-h" className="display">{p.current.title}</h1>
      <p className="notice">You are the GM, so direct edits become canon when you save.</p>
      <EditPageForm
        action={savePage.bind(null, id, p.id, p.current.number)}
        initial={editable}
        parent={T.parents.length > 0 ? {
          current: p.parentId ?? "",
          options: parentOptions,
          hint: `A ${T.label.toLowerCase()} can sit under: ${T.parents.map((t) => ENTRY_TYPES[t].label).join(", ")}`,
        } : null}
        info={infoFields(p.type)}
        choices={choices}
        sections={writtenFields(p.type)}
        cancelHref={`${base}/${p.id}`}
      />
    </section>
  );
}
