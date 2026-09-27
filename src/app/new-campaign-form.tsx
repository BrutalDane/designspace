"use client";
import { useActionState } from "react";
import { createCampaign, type FormState } from "@/app/actions";
import { RULESETS, CALENDARS } from "@/lib/reference";

export function NewCampaignForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createCampaign, undefined);
  const err = (k: string) => state?.fieldErrors?.[k]?.[0];
  return (
    <form action={action} className="stack" noValidate>
      <label className="field">Name
        <input id="name" name="name" required maxLength={80} placeholder="e.g. The Grey Marches" aria-describedby="name-err" />
        {err("name") && <span className="err" id="name-err">{err("name")}</span>}
      </label>
      <label className="field"><span>Setting <span className="opt">(optional)</span></span>
        <input id="setting" name="setting" maxLength={200} placeholder="World, region or starting place" />
      </label>
      <label className="field">Ruleset
        <select id="ruleset" name="ruleset" defaultValue="dnd2014">
          {Object.entries(RULESETS).map(([k, r]) => <option key={k} value={k}>{r.name}</option>)}
        </select>
      </label>
      <label className="field">Calendar
        <select id="calendar" name="calendar" defaultValue="harptos">
          {Object.entries(CALENDARS).map(([k, c]) => <option key={k} value={k}>{c.name}</option>)}
        </select>
      </label>
      <button className="btn primary" type="submit" disabled={pending}>{pending ? "Creating…" : "Create campaign"}</button>
    </form>
  );
}
