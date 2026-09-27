import { listPlaces } from "@/lib/dal";
import { buildTree } from "@/lib/tree";
import { PlaceTree } from "@/components/place-tree";

export default async function WikiLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tree = buildTree(await listPlaces(id));
  return (
    <div className="wiki">
      <div className="wiki-main">{children}</div>
      <PlaceTree campaignId={id} tree={tree} />
    </div>
  );
}
