"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PlaceSummary } from "@/lib/dal";
import { ancestors, buildTree, type TreeNode } from "@/lib/tree";

/**
 * The Wiki tree (reference/wiki-page-design.md → Tree): nested and collapsible, following the Parent hierarchy,
 * grouped by type group with a count, child counts on closed branches, the current page highlighted.
 * The path to the current page is open; the GM can open or close any branch.
 */
export function PlaceTree({ campaignId, places }: { campaignId: string; places: PlaceSummary[] }) {
  const path = usePathname();
  const base = `/c/${campaignId}/wiki`;
  const currentId = path.startsWith(`${base}/`) ? path.slice(base.length + 1).split("/")[0] : null;
  const onPath = new Set(currentId ? ancestors(places, currentId).map((a) => a.id) : []);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const node = (n: TreeNode<PlaceSummary>, depth: number): React.ReactNode => {
    const open = toggled[n.id] ?? onPath.has(n.id);
    const kids = n.children.length;
    return (
      <li key={n.id}>
        <div className="tn" style={{ "--d": depth } as React.CSSProperties}>
          {kids > 0
            ? <button type="button" className="tw" aria-expanded={open} aria-label={`${open ? "Collapse" : "Expand"} ${n.title}`}
                onClick={() => setToggled((t) => ({ ...t, [n.id]: !open }))}>{open ? "▾" : "▸"}</button>
            : <span className="tw-sp" />}
          <Link href={`${base}/${n.id}`} aria-current={n.id === currentId ? "page" : undefined}>
            {n.title}{kids > 0 && !open && <span className="tcount">{kids}</span>}
          </Link>
        </div>
        {open && kids > 0 && <ul>{n.children.map((c) => node(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <nav aria-label="Campaign pages" className={`wiki-side${currentId ? "" : " is-index"}`}>
      <div className="gh"><span>Places</span><span className="mono">{places.length}</span></div>
      {places.length > 0 ? <ul>{buildTree(places).map((n) => node(n, 0))}</ul> : <p className="muted small">No places yet.</p>}
    </nav>
  );
}
