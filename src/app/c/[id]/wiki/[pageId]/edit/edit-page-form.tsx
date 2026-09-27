"use client";
import { useActionState } from "react";
import Link from "next/link";
import type { Field } from "@/lib/reference";
import type { PageContent } from "@/lib/validation";
import type { PageFormState } from "../../actions";

type Props = {
  action: (s: PageFormState, f: FormData) => Promise<PageFormState>;
  initial: PageContent;
  parent: { current: string; options: { id: string; label: string }[]; hint: string } | null;
  info: string[];
  choices: Record<string, { id: string; label: string }[]>; // infobox fields that point at another page
  sections: Field[];
  cancelHref: string;
};

/** The page editor, in the prototype's order: Title, Parent, Lead, infobox fields, then the type's sections. */
export function EditPageForm({ action, initial, parent, info, choices, sections, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const err = (k: string) => state?.fieldErrors?.[k]?.[0];
  // After a rejected save the form shows what was typed, never the older saved text.
  const value = (k: string, saved: string) => state?.values?.[k] ?? saved;
  const errorFor = (k: string) => (err(k) ? <span className="err" id={`e-${k}`}>{err(k)}</span> : null);
  return (
    <form action={formAction} className="stack edit-form" noValidate>
      <label className="field">Title
        <input name="title" required maxLength={120} defaultValue={value("title", initial.title)} aria-invalid={!!err("title")} aria-describedby="e-title" />
        {errorFor("title")}
      </label>
      {parent && (
        <label className="field">Parent
          <span className="hint">{parent.hint}</span>
          <select name="parent" defaultValue={value("parent", parent.current)}>
            {parent.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
      )}
      <label className="field">Lead
        <textarea name="lead" rows={3} maxLength={2000} defaultValue={value("lead", initial.lead)} aria-describedby="e-lead" />
        {errorFor("lead")}
      </label>
      {info.map((k) => (
        <label className="field" key={k}>{k}
          {choices[k] ? (
            <select name={`i.${k}`} defaultValue={value(`i.${k}`, initial.info[k] ?? "")} aria-describedby={`e-i.${k}`}>
              <option value="">Not set</option>
              {choices[k].map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          ) : <input name={`i.${k}`} maxLength={200} defaultValue={value(`i.${k}`, initial.info[k] ?? "")} aria-describedby={`e-i.${k}`} />}
          {errorFor(`i.${k}`)}
        </label>
      ))}
      {sections.map((s) => (
        <label className="field" key={s.key}>{s.label}
          <textarea name={`s.${s.key}`} rows={3} defaultValue={value(`s.${s.key}`, initial.sections[s.key] ?? "")} aria-describedby={`e-s.${s.key}`} />
          {errorFor(`s.${s.key}`)}
        </label>
      ))}
      {state?.error && <p className="alert" role="alert">{state.error}</p>}
      <div className="actions sticky-actions">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        <Link className="btn" href={cancelHref}>Cancel</Link>
      </div>
    </form>
  );
}
