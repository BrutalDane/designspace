# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer; all five M0 checks passed. GitHub: https://github.com/BrutalDane/designspace
(private); the Quality gate runs there on every push to main and is green.

**M1 slice 1 (Places in the Wiki): done and merged.** Rebuilt to `reference/`; Thor tried it (added a Region, moved Vellumis with Parent).
The drift listed in `reference/README.md` is fixed (types, sections and groups, allowed parents, "Not written yet" lines,
infobox, read-aloud panel). `npm run check` is green (15 unit tests, 21 browser journeys). The local database is migrated
(backup taken first); Thor's pages kept their text.

## Left out of slice 1 (next slices, all in the reference)
Dungeon level with keyed areas; links between pages, backlinks and hover previews; search and Ctrl+K; the right context
pane (On this page, linked from, history); tree filter; aliases; export to Markdown; the other 15 types (people,
factions, threads, beliefs, lore, bestiary, items, rules) with their automatic lists (People here, Members, Carries).

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
