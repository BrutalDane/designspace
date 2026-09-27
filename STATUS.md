# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer. GitHub: https://github.com/BrutalDane/designspace (private); the
Quality gate runs on every push to main and is green.

**M1 slice 1 (Places in the Wiki): done and merged.** Built to `reference/`: place types, grouped sections, "At the table",
"Not written yet" lines, infobox, read-aloud, decided nesting, Parent field for moving, history and restore.

**M1 slice 2 (Links): done and merged.** Pages show links, Linked from, Links to and "On this page", and links survive
renames. Thor decided the GM does not type links; Worldbuilding writes them (M4).

**M1 slice 3 (People and groups): built on branch `m1/people`, waiting for Thor to try it.** Faction, NPC, Player
character, Party and Magic item with their layouts; People here, Members and Carries build themselves; tree grouped by
type group; "New page". `npm run check` is green (28 unit tests, 26 browser journeys). No database change.

## Waiting on Thor
Try slice 3 (below). Anything that feels off goes in FRICTION.md; then Claude merges `m1/people` and pushes.

## Slice 3 checks for Thor
1. Wiki → **New page** → NPC, give it a name. See the round badge and the Wants / Fears / Secret cards.
2. **Edit** the NPC: pick a **Location** (for example Vellumis) from the list, fill Wants and Voice, save.
3. Open Vellumis: the NPC appears under **Notable people here**; the Vale of Thren shows them under **People here** too.
4. **New page** → Faction. Set the NPC's **Faction** to it: the faction lists them under **Members**.
5. **New page** → Magic item. Set its **Holder** to the NPC: the NPC's page lists it under **Carries**.

## Next (order decided by Thor, 2026-09-27)
1. **M1 slice 4: The remaining types.** Arc, Thread / Front (clock and ladder), Clue (routes), Deity, Culture, Lore,
   Creature, Rule reference, House ruling, Dungeon level (keyed areas), Campaign State.
2. **Worldbuilding (M4) next**, before Sessions (M2) and the player wiki (M3). Needs the Claude API account and a spending
   limit set up by Thor first.
3. Later: search, Ctrl+K, hover previews, tree filter, aliases, export to Markdown.

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
