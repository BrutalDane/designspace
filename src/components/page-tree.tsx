"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PageSummary } from "@/lib/dal";
import { ENTRY_TYPES, GROUP_ORDER } from "@/lib/reference";
import { ancestors, buildTree, type TreeNode } from "@/lib/tree";

type TreePage = Pick<PageSummary, "id" | "parentId" | "type" | "title">;

/**
 * The Wiki tree (reference/wiki-page-design.md → Tree): nested and collapsible, following the Parent hierarchy,
 * grouped by type group with a count, child counts on closed branches, the current page highlighted.
 * The path to the current page is open; the GM can open or close any branch.
 */
export function PageTree({ campaignId, pages }: { campaignId: string; pages: TreePage[] }) {
  const path = usePathname();
  const base = `/c/${campaignId}/wiki`;
  const currentId = path.startsWith(`${base}/`) ? path.slice(base.length + 1).split("/")[0] : null;
  const onPath = new Set(currentId ? ancestors(pages, currentId).map((a) => a.id) : []);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const node = (n: TreeNode<TreePage>, depth: number): React.ReactNode => {
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

  const groups = GROUP_ORDER
    .map((g) => ({ name: g, pages: pages.filter((p) => ENTRY_TYPES[p.type].group === g) }))
    .filter((g) => g.pages.length > 0);
  return (
    <nav aria-label="Campaign pages" className={`wiki-side${currentId ? "" : " is-index"}`}>
      {groups.map((g) => (
        <div className="grp" key={g.name}>
          <div className="gh"><span>{g.name}</span><span className="mono">{g.pages.length}</span></div>
          {/* A page whose parent is in another group (none yet) starts its own branch in this group. */}
          <ul>{buildTree(g.pages.map((p) => ({ ...p, parentId: g.pages.some((x) => x.id === p.parentId) ? p.parentId : null }))).map((n) => node(n, 0))}</ul>
        </div>
      ))}
      {groups.length === 0 && <p className="muted small">No pages yet.</p>}
    </nav>
  );
}
