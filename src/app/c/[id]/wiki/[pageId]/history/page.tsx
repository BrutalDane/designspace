import { formatWhen } from "@/lib/format";
import type { Metadata } from "next";
import Link from "next/link";
import { getPage, listPages, listVersions } from "@/lib/dal";
import { ancestors } from "@/lib/tree";
import { changedParts } from "@/lib/validation";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Props = { params: Promise<{ id: string; pageId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, pageId } = await params;
  return { title: `History of ${(await getPage(id, pageId)).current.title} · Designspace` };
}

export default async function Page({ params }: Props) {
  const { id, pageId } = await params;
  const [p, places, versions] = await Promise.all([getPage(id, pageId), listPages(id), listVersions(id, pageId)]);
  const base = `/c/${id}/wiki/${p.id}`;
  return (
    <section aria-labelledby="hist-h">
      <Breadcrumbs base={`/c/${id}/wiki`} path={[...ancestors(places, p.id), { id: p.id, title: p.current.title }]} current="History" />
      <h1 id="hist-h" className="display">History of {p.current.title}</h1>
      <p className="muted">Every save is kept. Open an older version to read it or bring it back.</p>
      <ol className="versions" aria-label="Versions">
        {versions.map(({ version: v, author }, i) => (
          <li key={v.id}>
            <Link href={`${base}/history/${v.number}`}>Version {v.number}</Link>
            {v.number === p.current.number && <span className="pill">Current</span>}
            <span className="muted small"> · {formatWhen(v.createdAt)} · {author}</span>
            <div className="small">{changedParts(p.type, versions[i + 1]?.version, v).join(", ")}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
