"use client";
import { useActionState } from "react";
import Link from "next/link";
import type { Section } from "@/lib/reference";
import type { PageContent } from "@/lib/validation";
import type { PlaceFormState } from "../../actions";

type Props = { action: (s: PlaceFormState, f: FormData) => Promise<PlaceFormState>; sections: Section[]; initial: PageContent; cancelHref: string };

export function EditPlaceForm({ action, sections, initial, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const err = (k: string) => state?.fieldErrors?.[k]?.[0];
  // After a rejected save the form shows what was typed, never the older saved text.
  const value = (k: string, saved: string) => state?.values?.[k] ?? saved;
  return (
    <form action={formAction} className="stack edit-form" noValidate>
      <label className="field">Name
        <input name="title" required maxLength={120} defaultValue={value("title", initial.title)} aria-invalid={!!err("title")} aria-describedby="title-err" />
        {err("title") && <span className="err" id="title-err">{err("title")}</span>}
      </label>
      <label className="field">Summary
        <textarea name="summary" rows={3} maxLength={2000} defaultValue={value("summary", initial.summary)} aria-describedby="summary-hint summary-err" />
        <span className="hint" id="summary-hint">One or two lines that sum the place up. Shown at the top of the page.</span>
        {err("summary") && <span className="err" id="summary-err">{err("summary")}</span>}
      </label>
      {sections.map((s) => (
        <label key={s.key} className="doc-field">
          <span className="doc-field-h">{s.heading}</span>
          <span className="hint" id={`h-${s.key}`}>{s.hint}</span>
          <textarea name={`s.${s.key}`} rows={3} defaultValue={value(`s.${s.key}`, initial.sections[s.key] ?? "")} aria-describedby={`h-${s.key} e-${s.key}`} />
          {err(`s.${s.key}`) && <span className="err" id={`e-${s.key}`}>{err(`s.${s.key}`)}</span>}
        </label>
      ))}
      {state?.error && <p className="alert" role="alert">{state.error}</p>}
      <div className="actions sticky-actions">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save page"}</button>
        <Link className="btn ghost" href={cancelHref}>Cancel</Link>
      </div>
    </form>
  );
}
