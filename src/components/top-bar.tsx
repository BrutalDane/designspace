import Link from "next/link";
import { signOut } from "@/app/actions";
import { WorkspaceSwitcher } from "./workspace-switcher";

export function TopBar({ userName, campaign }: { userName: string; campaign?: { id: string; name: string; rulesetShort: string } }) {
  return (
    <header className="top">
      <Link href="/" className="brand" title="All campaigns">Designspace</Link>
      {campaign && <span className="campchip">{campaign.name} <span className="muted">· {campaign.rulesetShort}</span></span>}
      {campaign ? <WorkspaceSwitcher campaignId={campaign.id} /> : <span className="spacer" />}
      <form action={signOut} className="user">
        <span>{userName}</span><span className="muted small">GM</span>
        <button className="btn ghost small" type="submit">Sign out</button>
      </form>
    </header>
  );
}
