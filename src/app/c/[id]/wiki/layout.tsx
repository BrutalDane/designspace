import { listPlaces } from "@/lib/dal";
import { PlaceTree } from "@/components/place-tree";

export default async function WikiLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="wiki">
      <PlaceTree campaignId={id} places={await listPlaces(id)} />
      <div className="wiki-main">{children}</div>
    </div>
  );
}
