# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer. GitHub: https://github.com/BrutalDane/designspace (private); the
Quality gate runs on every push to main and is green.

**M1 slice 1 (Places in the Wiki): done and merged.** Built to `reference/`: place types, grouped sections, "At the table",
"Not written yet" lines, infobox, read-aloud, decided nesting, Parent field for moving, history and restore.

**M1 slice 2 (Links): done and merged.** Pages show links, Linked from, Links to and "On this page", and links survive
renames. Thor decided the GM does not type links; Worldbuilding writes them (M4). `npm run check`: 23 unit tests, 24 journeys.

## Left out (next slices, all in the reference)
Hover previews on links and the Ctrl+K quick switcher; search and the tree filter; Dungeon level with keyed areas;
aliases; export to Markdown; the other 15 types (people, factions, threads, beliefs, lore, bestiary, items, rules) with
their automatic lists (People here, Members, Carries); right-pane parts from later milestones (proposals, clocks, player
notes, timeline, sessions).

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
