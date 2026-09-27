# TTRPG Designspace — working notes and decisions

## Direction (2026-09-27)
- Fresh restart. Campaign-Design-Studio is reference only; the GM AI Vault (v4 copy) is the method and content source, read-only.
- Prototype first: validate design and workflow by clicking through it, then add the AI API when that part is built.
- **Keep it lean.** One concept per job; avoid the same information living in several places.
- Three guardrails carried from the vault philosophy:
  1. The co-GM proposes; the GM accepts.
  2. Nothing becomes canon silently. Direct GM edits are canon; AI output is a proposal.
  3. Play notes produce proposed consequences, never automatic changes. Uncertainty goes back to the GM as a question.
  - One deliberate exception: player-knowledge reveals that follow the GM's own reveal rules (see below).

## Product shape
- **Sign-in**: the GM signs in to edit. Players use a public player wiki, with access verified through the campaign's Discord server (membership plus a required role). Each Discord member maps to a player character.
- **Campaigns (front page)**: pick or create a campaign. Each campaign has its own:
  - ruleset (system and edition), enabled sourcebooks and house rulings
  - core references: setting, tone, calendar and current date, table, safety tools
  - the design principles the co-GM checks against
  - player wiki access

  Rules links resolve against the campaign's ruleset.
- **Wiki**: campaign atlas (World Anvil / Obsidian patterns).
  - Every entry type has a tailored layout: infobox, grouped sections, and an "At the table" GM group.
  - A nested, collapsible tree follows the hierarchy.
  - Lenses: Page, Graph, Map (for every place type), and Player knowledge (GM only).
  - Also: hover previews, Ctrl+K quick switcher, and pending-proposal markers.
- **Worldbuilding**: "New thread" asks "What are you making?" and shows the entry types grouped, plus Free thread.
  - The type supplies the lenses and checks.
  - The checklist is the type's own section list and ticks itself from what the change set fills; missing sections are clickable.
  - Context is filled automatically from the hierarchy (the page, what's above and inside it, and its links), and the GM leaves out or adds pages.
  - New pages ask "Where does it go?" and allow only valid parents.
- **Sessions**: the campaign timeline on an in-world calendar, plus the session library. Each session has Prep / At the table / After play.
  - Sessions own their encounters and handouts. "Hand out" puts a handout in the player wiki, with no copy to keep.
  - The Living World pass proposes consequences, dated timeline events and reveals, reviewed together in Worldbuilding.

## Lean review (decided 2026-09-27, built in v6)
- **Type = studio.** One taxonomy; studios are derived from the types.
- **Clocks live on threads.** Each clock is a field on a Thread/Front ("Driven by" links the NPC or faction). Varik Regroups is now a thread. Campaign State shows "Fronts and clocks".
- **One timeline.** World delta is gone. Campaign State shows "Recent events" from the timeline, and "New since Session N" is derived from it.
- **AI context comes from the hierarchy.**
- **Trimmed types:**
  - World truth is now Lore (Kind: World truth).
  - Session, Encounter and Handout live in Sessions.
  - Content labels are no longer a setting.
- Considered and not adopted (for now): a slimmer right pane; reviewing changes in place.

## Hierarchy (decided 2026-09-27, built in v6)
One Parent per page drives the tree, breadcrumbs, "Contains", the map and the AI context. Each type has allowed parent types, and the editor's Parent field only offers valid ones. Lists that build themselves, with no manual upkeep:
- **People here:** people whose Location is this place or anywhere inside it.
- **Members:** people whose Faction is this faction or one of its branches.
- **Carries:** items whose Holder is this person.

- **Places:** World / Plane → Region (nestable) → Settlement → District → Building / Site.
  - A Dungeon can sit under a Region, Settlement or District. Dungeon → Dungeon level, with keyed areas per level.
- **Factions:** Faction → Branch (a faction can also sit under a Deity, as an order).
- **Beliefs:** Deity → Deity/Order. Culture → Subculture.
- **Threads:** Arc → Thread / Front → Clue.
- **Bestiary:** Creature → Creature.
- **Lore:** Lore → Lore (era → event).
- **Rules:** Rule → House ruling.
- **Unnested:** NPCs, player characters and items.

Sample added from the vault:
- Faerûn (world)
- Vellumis's districts: Conclave Heights, Ledgerward, Bellmarket, Stillwater Quarters, Outer Registries, The Underbelly (Low Wards)
- In the Low Wards: the Community Kitchen and the Chapel of the Quiet Passing, with Geoffrey Erheart and Thane Wolft
- The Wardhold garrison (a Marchwardens branch) with Hessa Vorn
- The Scarrow's two levels

**Wiki types (22):**
- Campaign State, Arc, Thread/Front, Clue
- World/Plane, Region, Settlement, District, Building/Landmark, Site, Dungeon, Dungeon level
- Faction, NPC, Player character, Party
- Deity/Religion, Culture, Lore
- Creature, Magic item
- Rule reference, House ruling

## Player knowledge model (decided 2026-09-27, built in v5)
Principle: **no double bookkeeping.** There is one source of truth, the GM's page. Players see a filtered view of it, never a copy.
- **What gets revealed:** a part of a page (the lead, one infobox field, or one section). Everything starts hidden.
- **States:** Known, What we believe, Rumour. Each is revealed to the whole party or to specific characters.
- **Player version:** written only where belief differs or for rumours. The GM's text replaces it when the truth is revealed.
- **Player-facing name:** stays in place until the real name is revealed.
- **Reveals come from play.** Each records its session, and "New since Session N" is derived from that record.
- **Spoiler check:** computed per page, per proposal and across the whole wiki, with one-click fixes.
- **Player journal:** notes are shared with the party, with the GM only, or kept private. The GM promotes a note to a thread instead of copying it.
- **Session recaps** are the player-facing story.

## AI-assisted player knowledge (decided 2026-09-27, designed, not yet built)
Autonomy: **rules are applied automatically; exceptions come to the GM as questions.**
1. **Reveal rules per entry type.**
   - Place visited: reveal the lead, description and first impression.
   - NPC met: reveal the lead, appearance, role and voice.
   - Item held: reveal the lead, description and kind; its story goes to the holder only.
   - Never revealed automatically: "At the table" groups, secrets, hidden truths, NPC wants and fears, real names, and a Lore entry's truth.
2. **Post-session pass,** producing one card per page with the rule applied and the sentence that justifies it.
3. **Confidence decides what reaches the GM:** clear-cut reveals are applied and listed, each undoable; unclear ones are asked as questions; excluded ones are only suggested.
4. **Drafted player versions,** tied to their source text.
5. **Spoiler check by meaning,** on top of the computed check.
6. **Journal sorting.**
7. **Recap draft.**
8. **Record and undo,** and the ability to query what a character knows.

- **Guardrails:** secrets never auto-revealed; everything logged and reversible; the spoiler check runs after every pass.
- **Cost and data:** one AI pass per session with minimal context.

## Earlier decisions (2026-09-27)
- Section sets follow World Anvil's templates, plus an "At the table" group for GM use.
- Timeline uses the Calendar of Harptos, with example dates starting 1 Eleint 1492 DR.
- Only D&D 2014 in the prototype. Only the GM advances the campaign date.

## Prototype
- Artifact: https://claude.ai/artifact/3KGuAhh4Gej6uaQ3bgzegc (v6). Local copy: `reference/prototype-v6.html`.
- Sign-in and Discord verification are simulated. The co-GM is scripted; the spoiler check, checklist coverage and auto context are real logic. Changes are kept in the browser (Reset clears them).

## Next
- The AI-assisted player knowledge flow.
- Moving a page by dragging it in the tree.
- Grouping large post-session change sets.

## Open questions
- Tech stack and hosting. Needs real auth (GM account with 2FA) and Discord OAuth reading guild membership and roles only. (Since settled: see `build-plan.md` and the repo's DECISIONS.md.)
- How rulesets are imported: the vault's 5etools-derived reference is one source.
- Real map uploads, and festival days in calendars.
