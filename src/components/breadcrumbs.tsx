import Link from "next/link";

/** The path from the Wiki's front page down to the current page. */
export function Breadcrumbs({ base, path, current }: { base: string; path: { id: string; title: string }[]; current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        <li><Link href={base}>Wiki</Link></li>
        {path.map((a) => <li key={a.id}><Link href={`${base}/${a.id}`}>{a.title}</Link></li>)}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
