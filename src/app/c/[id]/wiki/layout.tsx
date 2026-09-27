import { listPages } from "@/lib/dal";
import { PageTree } from "@/components/page-tree";

export default async function WikiLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="wiki">
      <PageTree campaignId={id} pages={(await listPages(id)).map(({ id: pageId, parentId, type, title }) => ({ id: pageId, parentId, type, title }))} />
      <div className="wiki-main">{children}</div>
    </div>
  );
}
