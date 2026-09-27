# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer. GitHub: https://github.com/BrutalDane/designspace (private); the
Quality gate runs on every push to main and is green.

**M1 slice 1 (Places in the Wiki): done and merged.** Built to `reference/`: place types, grouped sections, "At the table",
"Not written yet" lines, infobox, read-aloud, decided nesting, Parent field for moving, history and restore.

**M1 slice 2 (Links): built on branch `m1/links`, waiting for Thor to try it.** `npm run check` is green (23 unit tests,
24 browser journeys). No database change in this slice.

## Waiting on Thor
Try slice 2 (checks below). Anything that feels off goes in FRICTION.md; then Claude merges `m1/links` into main and pushes.

## Slice 2 checks for Thor
1. Edit Vellumis and write `[[Vale of Thren]]` somewhere in the Description. Save: it is a link; click it.
2. On the Vale of Thren, the right pane shows "Linked from · 1" with Vellumis.
3. Write `[[The Drowned Bell]]` on a page: it shows grey with a dashed underline. Create a Building / Landmark with that
   title: the link comes alive.
4. Rename the Vale of Thren: the link on Vellumis shows the new name, and the editor shows `[[new name]]`.
5. Try `**bold**`, `*italic*` and lines starting with `- ` in a section.

## Left out (next slices, all in the reference)
Hover previews on links and the Ctrl+K quick switcher; search and the tree filter; Dungeon level with keyed areas;
aliases; export to Markdown; the other 15 types (people, factions, threads, beliefs, lore, bestiary, items, rules) with
their automatic lists (People here, Members, Carries); right-pane parts from later milestones (proposals, clocks, player
notes, timeline, sessions).

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
