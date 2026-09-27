# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer; all five M0 checks passed. GitHub: https://github.com/BrutalDane/designspace
(private); the Quality gate runs there on every push to main and is green.

**M1 slice 1 (Places in the Wiki): built on branch `m1/places`, waiting for Thor to try it.** `npm run check` is green
(13 unit tests, 18 browser journeys). The local database already has the new tables (backup taken first).

## First, before Thor tries slice 1
Slice 1 drifted from the decided design (invented section lists, missing place types, loosened nesting, hidden empty
sections). Fix it on `m1/places` using `reference/README.md` → "Known drift to fix" and `reference/wiki-page-design.md`,
re-run `npm run check`, then update the checks below to match.

## Waiting on Thor
Try slice 1 (checks below). Anything that feels off goes in FRICTION.md; then Claude merges `m1/places` into main and pushes.

## Slice 1 checks for Thor
1. Open your campaign's Wiki and add the first place (try a World).
2. Build a chain inside it: Region → Settlement → District → Site. Only sensible kinds are offered at each step.
3. Edit a settlement page: fill two or three sections, save. Empty sections don't show.
4. Open History, read version 1, restore it, and see it become the newest version.
5. Look at a page in a narrow browser window: breadcrumbs on place pages, the full tree on the Wiki front page.

## Left out of slice 1 (candidates for next slices)
Links between pages and backlinks, search, moving and deleting places, people/factions, player visibility.

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
