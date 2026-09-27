"use client";
import { useActionState } from "react";
import Link from "next/link";
import { PLACE_TYPES, type PlaceType } from "@/lib/reference";
import type { PlaceFormState } from "../actions";

export function NewPlaceForm({ action, kinds, cancelHref }: { action: (s: PlaceFormState, f: FormData) => Promise<PlaceFormState>; kinds: PlaceType[]; cancelHref: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const err = (k: string) => state?.fieldErrors?.[k]?.[0];
  const v = state?.values;
  return (
    <form action={formAction} className="stack" noValidate>
      <fieldset className="kinds">
        <legend>What kind of place?</legend>
        {kinds.map((k) => (
          <label key={k} className="kind-option">
            <input type="radio" name="type" value={k} defaultChecked={(v?.type ?? kinds[0]) === k} />
            <span><strong>{PLACE_TYPES[k].label}</strong> <span className="muted">{PLACE_TYPES[k].hint}</span></span>
          </label>
        ))}
        {err("type") && <span className="err">{err("type")}</span>}
      </fieldset>
      <label className="field">Name
        <input name="title" required maxLength={120} defaultValue={v?.title} aria-describedby="title-err" aria-invalid={!!err("title")} />
        {err("title") && <span className="err" id="title-err">{err("title")}</span>}
      </label>
      <label className="field"><span>Summary <span className="opt">(optional)</span></span>
        <textarea name="summary" rows={3} maxLength={2000} defaultValue={v?.summary} aria-describedby="summary-hint summary-err" />
        <span className="hint" id="summary-hint">One or two lines that sum the place up. You can fill in the rest of the page next.</span>
        {err("summary") && <span className="err" id="summary-err">{err("summary")}</span>}
      </label>
      {state?.error && <p className="alert" role="alert">{state.error}</p>}
      <div className="actions">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Creating…" : "Create place"}</button>
        <Link className="btn ghost" href={cancelHref}>Cancel</Link>
      </div>
    </form>
  );
}
