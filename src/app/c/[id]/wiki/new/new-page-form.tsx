"use client";
import { useActionState } from "react";
import Link from "next/link";
import { ENTRY_TYPES, GROUP_ORDER, type EntryType } from "@/lib/reference";
import type { PageFormState } from "../actions";

type Props = { action: (s: PageFormState, f: FormData) => Promise<PageFormState>; kinds: EntryType[]; cancelHref: string };

export function NewPageForm({ action, kinds, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const err = (k: string) => state?.fieldErrors?.[k]?.[0];
  const v = state?.values;
  return (
    <form action={formAction} className="stack" noValidate>
      <fieldset className="kinds">
        <legend>What are you making?</legend>
        {GROUP_ORDER.filter((g) => kinds.some((k) => ENTRY_TYPES[k].group === g)).map((g) => (
          <div key={g} className="kind-group">
            <span className="toc-g">{g}</span>
            {kinds.filter((k) => ENTRY_TYPES[k].group === g).map((k) => (
              <label key={k} className="kind-option">
                <input type="radio" name="type" value={k} defaultChecked={(v?.type ?? kinds[0]) === k} />
                <span>{ENTRY_TYPES[k].label}</span>
              </label>
            ))}
          </div>
        ))}
        {err("type") && <span className="err">{err("type")}</span>}
      </fieldset>
      <label className="field">Title
        <input name="title" required maxLength={120} defaultValue={v?.title} aria-describedby="title-err" aria-invalid={!!err("title")} />
        {err("title") && <span className="err" id="title-err">{err("title")}</span>}
      </label>
      <label className="field">Lead
        <textarea name="lead" rows={3} maxLength={2000} defaultValue={v?.lead} aria-describedby="lead-err" />
        {err("lead") && <span className="err" id="lead-err">{err("lead")}</span>}
      </label>
      {state?.error && <p className="alert" role="alert">{state.error}</p>}
      <div className="actions">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Creating…" : "Create page"}</button>
        <Link className="btn" href={cancelHref}>Cancel</Link>
      </div>
    </form>
  );
}
