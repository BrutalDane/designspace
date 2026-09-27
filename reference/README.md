# reference/ — what has been decided

This folder is the product reference. Code must follow it. Where the code and this folder disagree, this folder wins
unless DECISIONS.md records that Thor agreed to the change.

| File | What it is |
|---|---|
| `designspace-decisions.md` | Product decisions: direction, lean rules, hierarchy, the 22 types, player knowledge model. Copy of the claude.ai Project doc. |
| `build-plan.md` | Roles, stack, way of working, milestones M0–M6. Copy of the claude.ai Project doc. |
| `wiki-page-design.md` | How every Wiki page looks and feels, plus the section list and allowed parents for every type. |
| `prototype-v6.html` | The accepted prototype. Open it in a browser and click through; it runs on its own. |
| `prototype-v6-types.js` | The prototype's type definitions (sections, infobox fields, allowed parents). Source for the table in `wiki-page-design.md`. |

## Rules for Claude Code
1. Before a slice, read the parts of these files that the slice touches, and open the prototype screen it rebuilds.
2. Build what is here. **Do not invent** section names, types, fields, nesting rules or features that are not here.
   The prototype is a reference for behaviour and layout, not code to copy (it is a single-file mock).
3. If something is missing, unclear, or looks wrong, ask Thor one multiple-choice question before building it,
   then record the answer as one line in DECISIONS.md. Don't fill the gap with your own design.
4. "Not decided" lists in `wiki-page-design.md` and `designspace-decisions.md` are off limits until Thor decides.
5. These are copies. If Thor changes a decision in the claude.ai Project, the copy here is updated in the same session.

## Known drift to fix (found 2026-09-27, in branch `m1/places`, M1 slice 1)
Slice 1 was built from its own section lists instead of the reference. Before `m1/places` is merged:
- **Section sets:** `src/lib/reference.ts` uses invented sections (e.g. World "What it feels like", Region "Character",
  Settlement "Services", Site "Consequences"). Replace them with the groups and sections in `wiki-page-design.md`
  (Overview / The land / People and powers / Travel / At the table for a Region, and so on), including the grouping
  and the "At the table" GM group.
- **Place types:** the reference has World/Plane, Region, Settlement, District, **Building/Landmark**, Site,
  **Dungeon** and **Dungeon level**. Slice 1 folds buildings, ruins and dungeons into Site. Add the missing types
  (Dungeon levels can follow in a later slice, but Site must not stand in for them).
- **Allowed parents:** use the "Allowed parents" in `wiki-page-design.md`. Slice 1 allows Settlement under World,
  Region and Settlement at the top, and Site under World; none of these were decided. If a one-town campaign without a
  World page is wanted, ask Thor rather than loosening the rules.
- **Empty sections:** slice 1 hides them completely. Decided: show a quiet "Not written yet: …" line per group
  (a fully empty group collapses to one line), so the page shows what could still be written.
- **Infobox:** each type has infobox fields (e.g. Settlement: Population, Governance, Economy, Defence). Check that
  slice 1 has the infobox and the first-impression read-aloud panel; add them if not.
- The existing storage model (identity + numbered versions, the newest is the page) is fine and stays.
