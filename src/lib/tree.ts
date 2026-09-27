/** Turns the flat list of places into the Wiki tree, and finds the path to a place. No database access. */
export type TreeItem = { id: string; parentId: string | null; title: string };
export type TreeNode<T extends TreeItem> = T & { children: TreeNode<T>[] };

export function buildTree<T extends TreeItem>(items: T[]): TreeNode<T>[] {
  const nodes = new Map(items.map((i) => [i.id, { ...i, children: [] as TreeNode<T>[] }]));
  const roots: TreeNode<T>[] = [];
  for (const n of nodes.values()) ((n.parentId && nodes.get(n.parentId)?.children) || roots).push(n);
  const sort = (list: TreeNode<T>[]) => {
    list.sort((a, b) => a.title.localeCompare(b.title));
    list.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

/** The places above `id`, from the top of the tree down (not including the place itself). */
export function ancestors<T extends TreeItem>(items: T[], id: string): T[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const path: T[] = [];
  let parent = byId.get(id)?.parentId;
  while (parent && path.length < items.length) {
    const item = byId.get(parent);
    if (!item) break;
    path.unshift(item);
    parent = item.parentId;
  }
  return path;
}
