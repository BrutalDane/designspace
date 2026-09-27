# Status

_Last updated: 2026-09-27 (session 3, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done.** Running on Thor's computer. GitHub: https://github.com/BrutalDane/designspace (private); the
Quality gate runs on every push to main and is green.

**M1 slices 1–3: done and merged.** Places (to `reference/`), links (the GM doesn't type them; Worldbuilding will),
people and groups (NPC, PC, Party, Faction, Magic item; People here, Members, Carries build themselves).

**M1 slice 4 (The remaining types): done and merged.** Thor tried it (an Arc, a Thread with a clock, a Clue with three routes). All decided types
now exist: Arc, Thread / Front (clock, ladder, Driven by), Clue (routes to tick, warning under three), Deity, Culture,
Lore (GM-only truth), Creature, Rule reference with House rulings, Dungeon level (keyed areas). Campaign State is the
Wiki's front page (fronts and clocks, other open threads). `npm run check` is green (34 unit tests, 28 browser journeys).
The local database has the new "data" column (backup taken first).

## Next (order decided by Thor, 2026-09-27)
1. **Lean audit** of the whole app (due every five slices; slice 5 is next) before Worldbuilding starts.
2. **Worldbuilding (M4)**, before Sessions (M2) and the player wiki (M3). Thor sets up the Claude API account and a
   spending limit first (Claude will walk him through it).
3. Later: search, Ctrl+K, hover previews, tree filter, aliases, export to Markdown; Campaign State's "Recent events"
   arrives with the timeline in Sessions.

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).
