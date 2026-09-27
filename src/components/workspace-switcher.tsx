"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKSPACES } from "@/lib/reference";

export function WorkspaceSwitcher({ campaignId }: { campaignId: string }) {
  const path = usePathname();
  return (
    <nav className="ws" aria-label="Workspaces">
      {WORKSPACES.map((w) => {
        const href = `/c/${campaignId}/${w.slug}`;
        const current = path.startsWith(href);
        return <Link key={w.slug} href={href} aria-current={current ? "page" : undefined} className={`ws-${w.slug}`}><span className="dot" aria-hidden="true" />{w.label}</Link>;
      })}
    </nav>
  );
}
