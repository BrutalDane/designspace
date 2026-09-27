"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import type { Field } from "@/lib/reference";
import { CLOCK_SEGMENTS, type Area } from "@/lib/page-data";
import type { PageContent } from "@/lib/validation";
import type { PageFormState } from "../../actions";

type Props = {
  action: (s: PageFormState, f: FormData) => Promise<PageFormState>;
  initial: PageContent;
  parent: { current: string; options: { id: string; label: string }[]; hint: string } | null;
  info: string[];
  choices: Record<string, { id: string; label: string }[]>; // infobox fields that point at another page
  sections: Field[];
  structured: { parts: { clock: boolean; routes: boolean; areas: boolean }; clockPos: string; portent: string; routes: string; areas: Area[] };
  cancelHref: string;
};

/** The page editor, in the prototype's order: Title, Parent, Lead, infobox fields, then the type's sections. */
export function EditPageForm({ action, initial, parent, info, choices, sections, structured, cancelHref }: Props) {
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
      {structured.parts.clock && (
        <fieldset className="field-set">
          <legend>Clock</legend>
          <label className="field">Filled segments
            <select name="d.clock" defaultValue={value("d.clock", structured.clockPos)}>
              <option value="">No clock</option>
              {Array.from({ length: CLOCK_SEGMENTS + 1 }, (_, i) => <option key={i} value={String(i)}>{i} of {CLOCK_SEGMENTS}</option>)}
            </select>
          </label>
          <label className="field">Next portent
            <input name="d.portent" maxLength={300} defaultValue={value("d.portent", structured.portent)} />
          </label>
        </fieldset>
      )}
      {structured.parts.routes && (
        <label className="field">Routes to it
          <span className="hint">One route per line. Aim for at least three.</span>
          <textarea name="d.routes" rows={4} defaultValue={value("d.routes", structured.routes)} />
        </label>
      )}
      {structured.parts.areas && <AreasEditor initial={state?.values?.["d.areas"] ? JSON.parse(state.values["d.areas"]) as Area[] : structured.areas} />}
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

/** Keyed areas as rows of number, area and what is here (the prototype's table), with rows to add and remove. */
function AreasEditor({ initial }: { initial: Area[] }) {
  const [rows, setRows] = useState<Area[]>(initial.length ? initial : [{ n: "1", area: "", text: "" }]);
  const set = (i: number, k: keyof Area, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  return (
    <fieldset className="field-set">
      <legend>Keyed areas</legend>
      {rows.map((row, i) => (
        <div className="area-row" key={i} role="group" aria-label={`Area ${i + 1}`}>
          <label className="field">#<input name="a.n" value={row.n} maxLength={10} onChange={(e) => set(i, "n", e.target.value)} /></label>
          <label className="field">Area<input name="a.area" value={row.area} maxLength={120} onChange={(e) => set(i, "area", e.target.value)} /></label>
          <label className="field">What is here<textarea name="a.text" rows={2} value={row.text} maxLength={2000} onChange={(e) => set(i, "text", e.target.value)} /></label>
          <button type="button" className="btn small" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label={`Remove area ${i + 1}`}>Remove</button>
        </div>
      ))}
      <p><button type="button" className="btn small" onClick={() => setRows((r) => [...r, { n: String(r.length + 1), area: "", text: "" }])}>Add an area</button></p>
    </fieldset>
  );
}
