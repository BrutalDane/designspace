"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLACE_TYPES } from "@/lib/reference";
import type { PlaceSummary } from "@/lib/dal";
import type { TreeNode } from "@/lib/tree";

/** The Wiki's tree of places. On phones it only shows on the Wiki's front page; place pages have breadcrumbs instead. */
export function PlaceTree({ campaignId, tree }: { campaignId: string; tree: TreeNode<PlaceSummary>[] }) {
  const path = usePathname();
  const base = `/c/${campaignId}/wiki`;
  const list = (nodes: TreeNode<PlaceSummary>[]) => (
    <ul>
      {nodes.map((n) => {
        const href = `${base}/${n.id}`;
        return (
          <li key={n.id}>
            <Link href={href} aria-current={path === href || path.startsWith(`${href}/`) ? "page" : undefined}>
              <span>{n.title}</span><span className="kind">{PLACE_TYPES[n.type].label}</span>
            </Link>
            {n.children.length > 0 && list(n.children)}
          </li>
        );
      })}
    </ul>
  );
  return (
    <nav aria-labelledby="tree-h" className={`wiki-side${path === base ? " is-index" : ""}`}>
      <h2 id="tree-h" className="eyebrow">Places</h2>
      {tree.length > 0 ? list(tree) : <p className="muted small">No places yet.</p>}
    </nav>
  );
}
