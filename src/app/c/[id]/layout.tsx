import { getCampaign, requireGM } from "@/lib/dal";
import { RULESETS } from "@/lib/reference";
import { TopBar } from "@/components/top-bar";

export default async function CampaignLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gm = await requireGM();
  const c = await getCampaign(id);
  return (
    <>
      <TopBar userName={gm.name} campaign={{ id: c.id, name: c.name, rulesetShort: RULESETS[c.ruleset]?.short ?? c.ruleset }} />
      <main className="page" id="main">{children}</main>
    </>
  );
}
