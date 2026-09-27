# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer; all five M0 checks passed. GitHub: https://github.com/BrutalDane/designspace
(private); the Quality gate runs there on every push to main and is green.

**M1 slice 1 (Places in the Wiki): rebuilt to `reference/` on branch `m1/places`, waiting for Thor to try it.**
The drift listed in `reference/README.md` is fixed (types, sections and groups, allowed parents, "Not written yet" lines,
infobox, read-aloud panel). `npm run check` is green (15 unit tests, 21 browser journeys). The local database is migrated
(backup taken first); Thor's two pages kept their text. Vellumis still sits directly under Fáerun from before the fix:
it keeps that parent until Thor moves it under a Region with the editor's Parent field.

## Waiting on Thor
Try slice 1 (checks below). Anything that feels off goes in FRICTION.md; then Claude merges `m1/places` into main and pushes.

## Slice 1 checks for Thor
1. On Fáerun, add a Region inside it (only Region is offered inside a World / Plane).
2. Open Vellumis, click Edit, set Parent to the new region, save. The breadcrumbs follow.
3. Fill a few infobox fields and sections on Vellumis, including First impression, and save. Check: the "Read aloud" panel,
   the grouped sections, the red "At the table · GM only" box, "Not written yet" lines, and the infobox on the right.
4. Add a District inside Vellumis, then a Building / Landmark inside the District. Vellumis lists the District automatically.
5. Open History on Vellumis, read version 1, restore it, and see it become the newest version.
6. Narrow the browser window: the infobox moves above the article; the tree is on the Wiki front page.

## Left out of slice 1 (next slices, all in the reference)
Dungeon level with keyed areas; links between pages, backlinks and hover previews; search and Ctrl+K; the right context
pane (On this page, linked from, history); tree filter; aliases; export to Markdown; the other 15 types (people,
factions, threads, beliefs, lore, bestiary, items, rules) with their automatic lists (People here, Members, Carries).

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
