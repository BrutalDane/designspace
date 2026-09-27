# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer. GitHub: https://github.com/BrutalDane/designspace (private); the
Quality gate runs on every push to main and is green.

**M1 slice 1 (Places in the Wiki): done and merged.** Built to `reference/`: place types, grouped sections, "At the table",
"Not written yet" lines, infobox, read-aloud, decided nesting, Parent field for moving, history and restore.

**M1 slice 2 (Links): done and merged.** Pages show links, Linked from, Links to and "On this page", and links survive
renames. Thor decided the GM does not type links; Worldbuilding writes them (M4).

**M1 slice 3 (People and groups): done and merged.** Thor tried it (an NPC with Location and Faction, an item with a Holder). Faction, NPC, Player
character, Party and Magic item with their layouts; People here, Members and Carries build themselves; tree grouped by
type group; "New page". `npm run check` is green (28 unit tests, 26 browser journeys). No database change.

## Next (order decided by Thor, 2026-09-27)
1. **M1 slice 4: The remaining types.** Arc, Thread / Front (clock and ladder), Clue (routes), Deity, Culture, Lore,
   Creature, Rule reference, House ruling, Dungeon level (keyed areas), Campaign State.
2. **Worldbuilding (M4) next**, before Sessions (M2) and the player wiki (M3). Needs the Claude API account and a spending
   limit set up by Thor first.
3. Later: search, Ctrl+K, hover previews, tree filter, aliases, export to Markdown.

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
