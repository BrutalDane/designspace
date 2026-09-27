"use client";
import type { Route } from "@/lib/page-data";

/**
 * A clue's routes, each with a "found" checkbox (as in the prototype). Ticking one saves a new version of the page.
 * `mark` is a server action bound to the page; it receives the route's index and its new state.
 */
export function RouteList({ routes, mark, labels }: { routes: Route[]; mark: (index: number, found: boolean, form?: FormData) => Promise<void>; labels: React.ReactNode[] }) {
  return (
    <ul className="routes">
      {routes.map((r, i) => (
        <li key={i}>
          <form action={mark.bind(null, i, !r.found)}>
            <label>
              <input type="checkbox" defaultChecked={r.found} onChange={(e) => e.currentTarget.form?.requestSubmit()} />
              <span>{labels[i]}</span>
            </label>
          </form>
          <span className="muted small">{r.found ? "found" : "not found"}</span>
        </li>
      ))}
    </ul>
  );
}
