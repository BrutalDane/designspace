import type { Metadata } from "next";
import Link from "next/link";
import { getCampaign, getPage, listPages, listVersions, pageLinks } from "@/lib/dal";
import { ENTRY_TYPES, RULESETS, childTypes } from "@/lib/reference";
import { ancestors, byTitle } from "@/lib/tree";
import { linkIndex } from "@/lib/links";
import { carries, drivenBy, members, partyMembers, peopleHere } from "@/lib/auto-lists";
import { markRoute } from "../actions";
import { changedParts } from "@/lib/validation";
import { PageArticle, monogram } from "@/components/page-article";
import { ContextPane } from "@/components/context-pane";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Props = { params: Promise<{ id: string; pageId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, pageId } = await params;
  const [c, p] = await Promise.all([getCampaign(id), getPage(id, pageId)]);
  return { title: `${p.current.title} · ${c.name} · Designspace` };
}


export default async function Page({ params }: Props) {
  const { id, pageId } = await params;
  const [c, p, pages, links, versions] = await Promise.all([getCampaign(id), getPage(id, pageId), listPages(id), pageLinks(id, pageId), listVersions(id, pageId)]);
  const base = `/c/${id}/wiki`;
  const T = ENTRY_TYPES[p.type];
  const lists = {
    inside: byTitle(pages.filter((x) => x.parentId === p.id)),
    people: byTitle(peopleHere(pages, p.id)),
    members: byTitle(members(pages, p.id)),
    carries: byTitle(carries(pages, p.id)),
    party: T.fam === "party" ? byTitle(partyMembers(pages)) : [],
    clocks: byTitle(drivenBy(pages, p.id)),
  };
  const parent = pages.find((x) => x.id === p.parentId) ?? null;
  const title = p.current.title;
  return (
    <div className="page-layout">
      <article aria-labelledby="page-h">
        <Breadcrumbs base={base} path={ancestors(pages, p.id)} current={title} />
        {T.fam === "person" ? (
          <div className="person-h">
            <div className={`mono-badge${p.type === "pc" ? " pc" : ""}`} aria-hidden="true">{monogram(title)}</div>
            <h1 id="page-h" className="display">{title}</h1>
          </div>
        ) : <h1 id="page-h" className="display">{title}</h1>}
        <div className="docbar">
          <span className="pill p-draft">{T.label}</span>
          <span className="spacer" />
          <Link className="btn" href={`${base}/${p.id}/edit`}>Edit</Link>
        </div>
        <PageArticle
          type={p.type} content={p.current} base={base} index={linkIndex(pages)} parent={parent} lists={lists}
          ruleset={RULESETS[c.ruleset]?.short} markRoute={markRoute.bind(null, id, p.id, p.current.number)}
        />
        {childTypes(p.type).length > 0 && (
          <p className="add-inside"><Link className="btn small" href={`${base}/new?parent=${p.id}`}>{T.fam === "place" ? `Add a place inside ${title}` : `Add a page inside ${title}`}</Link></p>
        )}
      </article>
      <ContextPane
        base={base} pageId={p.id} type={p.type} content={p.current} hasInside={lists.inside.length > 0}
        linksTo={links.linksTo} linkedFrom={links.linkedFrom} clocks={lists.clocks}
        versions={versions.map(({ version: v }, i) => ({ number: v.number, createdAt: v.createdAt, changed: changedParts(p.type, versions[i + 1]?.version, v).join(", ") }))}
      />
    </div>
  );
}
