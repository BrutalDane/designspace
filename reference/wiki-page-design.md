# How Wiki pages should look and feel

Decided with Thor on 2026-09-27 while building prototypes v1–v6. Some of this was only ever in the chat and in the
prototype code, not in `designspace-decisions.md`, so it is written down here. **This file plus `prototype-v6.html` is the
reference for every Wiki page.** The exact section lists per type come from the prototype's `types.js` (copied as
`prototype-v6-types.js`) and are listed at the bottom of this file.

Open `prototype-v6.html` in a browser (it runs on its own, no server; use the simulated GM sign-in) and click through
the Wiki: Vellumis (Settlement), The Grey Marches (Region), The Scarrow (Dungeon), Maret Holwick (NPC),
the Marchwardens (Faction), a Thread, a Clue and a Magic item show each layout family.

## Where the section sets come from
- Thor asked for layouts tailored to each kind of entry, and for places in particular to have room for description,
  culture, points of interest and similar ("please refer to best practice for worldbuilding wikis").
- The section sets therefore follow **World Anvil's article templates** (for example, Settlement: Demographics,
  Government, Industry and trade, Infrastructure, Defences, Architecture, Surroundings), grouped under plain headings,
  **plus one "At the table" group** that holds the GM's working material (first impression, current situation,
  rumours, hooks, secrets, "if the party does nothing").
- Do not invent other section names. If a section seems missing or wrong, ask Thor; don't substitute your own set.

## Page anatomy (every type)
1. **Breadcrumbs** built from the Parent chain (e.g. Faerûn › The Grey Marches › Vellumis › The Underbelly).
2. **Title**, with "also known as" aliases in italics.
3. **Docbar:** type pill · "Players know N parts" (or "Hidden from players") · lenses (Page / Graph / Map for place
   types / Player knowledge) · Edit · "Develop in the X studio" (from M4).
4. **Lead**: one or two sentences in the serif font, larger than body text.
5. **Two columns:** the article on the left, a sticky **infobox** on the right (image or map slot on top, the title,
   then the type's infobox fields as label/value rows; missing infobox fields are listed small underneath).
   On narrow screens the infobox moves above the article.
6. **Grouped sections.** Each group has a small uppercase heading with an accent rule under it. Sections inside use h2.
7. **"At the table" and other GM groups** sit in a bordered box with a red heading and a red "GM only" pill, so GM
   material is visually unmistakable. They are never shown in the player view.
8. **Empty sections are not shown as empty boxes.** Inside a group with content, a quiet line at the end reads
   "Not written yet: Religion, Defences". A group with no content at all collapses to a single line
   ("**Economy** not written yet: Industry and trade, Infrastructure"). This keeps the page clean *and* shows what
   could still be written. (The layout is a guide, not a form.)
9. **Automatic lists** appear as sections inside their group, never typed by hand:
   - *Contains / children* (e.g. "Districts and points of interest") as cards with title and lead.
   - *People here*: people whose Location is this place or anywhere inside it, shown as monogram + name + role.
   - *Members*: people whose Faction is this faction or one of its branches.
   - *Carries*: items whose Holder is this person.
10. **Bottom:** "Develop this settlement in the Settlement studio →" (Worldbuilding, M4).

### Right pane (context), top to bottom
On this page (table of contents grouped by section group) · open proposals for this page · clocks (threads "Driven
by" this page) · player notes about it (journal, from M3) · on the timeline · linked from · links to · in sessions ·
history.

### Tree
Nested and collapsible, following the Parent hierarchy, grouped by type group (Places, People, Factions, Threads,
Beliefs, World, Bestiary, Items, Rules, Party). Child counts shown small in mono. The current page is highlighted.

### Everywhere
Wikilinks in accent colour with a faint underline; links to pages that don't exist yet are grey with a dashed
underline. Hovering a link shows a preview card (title, type, lead, three infobox facts). Ctrl+K opens a quick
switcher. A pending proposal shows an ochre "Proposal pending" marker next to the affected section.

## Layout families (extra elements on top of the anatomy above)
- **Places** (World, Region, Settlement, District, Building/Landmark, Site, Dungeon, Dungeon level):
  a **"First impression" read-aloud panel** near the top (grey panel, "Read aloud" eyebrow, italic serif text).
  Map lens available. Dungeon levels have **keyed areas** (a numbered table: area, what's here).
- **NPC and Player character:** a round **monogram badge** next to the name (accent for NPCs, blue for PCs).
  Below the lead, a **triad of three cards**: NPC = Wants / Fears / Secret; PC = Drive / Burden / Secret (GM).
  Then a **Voice** quote (a line of how they talk, italic serif with an accent bar). Triad and secret are GM-only.
- **Faction:** a **Public face | Hidden truth · GM** split (hidden side tinted red), a **Will absolutely do | Won't do**
  split, and the clocks of threads it drives shown near the top. Members list is automatic.
- **Thread / Front:** a **big clock** (segments filled) at the top right, then a **ladder**: Impulse → Portents → If
  ignored (the doom step in red).
- **Clue / Revelation:** the truth, then a **routes list** with a checkbox per route (found / not found). Fewer than
  three routes shows a warning: "Fewer than three routes. If the party misses this one, the truth is gone."
- **Magic item:** an **item card** with pills for rarity, kind and attunement, and a **mechanics box** (ochre left bar).
- **Arc, Deity, Culture, Lore, Creature, House ruling:** the plain document layout (anatomy only). Lore keeps
  "What people believe" (player-facing) apart from "The truth" (GM).
- **Campaign State:** a dashboard, not an article: fronts and clocks, and recent events from the timeline.
- **Handouts** are not Wiki types; they live in Sessions and render as paper-styled text.

## Player view (M3) — same page, filtered
- Built on the server from revealed parts only. Shows the player-facing name until the real name is revealed.
- Hidden links render as plain text. GM groups, triads, hidden truths and "not written yet" lines never appear.
- Rumour and "What we believe" parts carry small badges. Party journal notes about the page appear with it.
- Player home: "New since Session N", the party, the story so far (recaps), people, places, journal, timeline.

## Visual tokens
From `prototype-v6.html` (`:root`): background `#E7EBE6`, surface `#F5F7F3`, ink `#1B2320`, verdigris accent
`#2C6A62`, ochre `#9E6B1E` (darkened in the app for contrast), review blue `#3D5B85`, danger red `#9A3A2D`.
Fonts: Alegreya (headings, lead, read-aloud, quotes), Alegreya Sans (body), JetBrains Mono (numbers, counts).
Dark mode follows the system.

## Not decided — do not build without asking Thor
- Map uploads and real maps (the Map lens is a placeholder layout until M6).
- Moving a page by dragging it in the tree (a Parent field in the editor is the decided way to move).
- Grouping large post-session change sets.
- The AI reveal automation (designed, built in M5).
- Rulesets other than D&D 2014; festival days in calendars.
- Any section, type, field or nesting rule that is not in this file or `prototype-v6-types.js`.

## Per-type layouts (generated from `prototype-v6-types.js`)
`[automatic: …]` marks a list the app builds itself. "Allowed parents" is the decided nesting; it is authoritative.
Infobox "Parent" is the page's position in the tree, not a typed field.

### Campaign State (`campaign`)
- Group: Campaign. Layout family: dash.

### Arc (`arc`)
- Group: Threads. Layout family: doc. Allowed parents: none (top level). Children shown as: Threads.
- Infobox: Phase, Theme
- **The arc**: Core conflict; Theme and questions; Acts
- **Stakes** (GM only): If unresolved; If resolved badly
- Studio: The shape of a campaign act: conflict, theme and stakes. Lenses: Arc alignment, Lore continuity. Checks: Player choices must matter.

### Thread / Front (`thread`)
- Group: Threads. Layout family: front. Allowed parents: arc. Children shown as: Clues.
- Infobox: Status, Parent, Pressure, Driven by
- **The front**: Impulse: why it moves; Portents; If ignored
- **At the table** (GM only): Visible signs; Next beat; GM use
- Studio: A pressure that moves on its own clock, with portents and a doom. Lenses: Faction operator, Living world. Checks: The world does not wait: it has a clock; Legible stakes: every tick has a visible sign.

### Clue / Revelation (`clue`)
- Group: Threads. Layout family: clue. Allowed parents: thread.
- **The revelation**: The truth it reveals; What it points toward
- Studio: A truth and at least three independent routes to it. Lenses: Revelation design, Session architecture. Checks: No chokepoints: three independent routes.

### World / Plane (`world`)
- Group: Places. Layout family: place. Allowed parents: none (top level). Children shown as: Regions.
- Infobox: Type, Parent
- **Overview**: Description; Cosmology; History
- **Places**: Regions [automatic: children]
- **At the table** (GM only): In this campaign; Secrets
- Studio: The world or plane the campaign lives in. Lenses: Lore weaving, Lore continuity. Checks: Label canon, extrapolation and homebrew.

### Region (`region`)
- Group: Places. Layout family: place. Allowed parents: world, region. Children shown as: Places.
- Infobox: Type, Parent, Terrain, Climate, Authority, Population, Danger
- **Overview**: Description; History
- **The land**: Geography; Climate and seasons; Fauna and flora; Local phenomena; Natural resources
- **People and powers**: Peoples and cultures; Who holds power; Settlements and sites [automatic: children]; People here [automatic: people here]
- **Travel**: Roads and routes; Hazards
- **At the table** (GM only): First impression; What is happening now; Creature pressures; Rumours; Hooks; Secrets; If the party does nothing
- Studio: Land, powers, pressures and routes for a whole area. Lenses: Location design, Lore continuity, Faction operator. Checks: What happens here if the party does nothing?; Every pressure has a visible sign.

### Settlement (`settlement`)
- Group: Places. Layout family: place. Allowed parents: region. Children shown as: Districts and places.
- Infobox: Type, Parent, Population, Governance, Economy, Defence
- **Overview**: Description; History
- **Society**: Demographics; Government; Culture and customs; Religion; Factions and guilds
- **Economy**: Industry and trade; Infrastructure
- **Places**: Districts; Districts and points of interest [automatic: children]; Architecture; Surroundings
- **Defence**: Defences
- **At the table** (GM only): First impression; Current situation; Notable people here [automatic: people here]; Rumours; Hooks; Secrets; If the party does nothing
- Studio: Purpose, governance, economy, defence, people and an ongoing problem. Lenses: Location design, NPC & faction. Checks: Carry prior business: it has a life without the party.

### District (`district`)
- Group: Places. Layout family: place. Allowed parents: settlement. Children shown as: Places.
- Infobox: Type, Parent, Population, Watch
- **Overview**: Description; Character; History
- **Life here**: Who lives here; Factions and networks; Points of interest [automatic: children]
- **At the table** (GM only): First impression; Current pressure; Notable people here [automatic: people here]; Rumours; Hooks; Secrets
- Studio: A quarter of a city with its own character, people and pressure. Lenses: Location design, NPC & faction. Checks: Has a current pressure the party can notice.

### Building / Landmark (`building`)
- Group: Places. Layout family: place. Allowed parents: district, settlement, region. Children shown as: Parts.
- Infobox: Type, Parent, Owner, Built
- **Overview**: Description; Purpose; History
- **Design**: Design and architecture; Layout and rooms; Entries and exits; Sensory details
- **At the table** (GM only): First impression; Who is here [automatic: people here]; Rumours; Hooks; Secrets; If the party does nothing
- Studio: A single building or landmark, ready for the table. Lenses: Location design, Scene writing. Checks: Sensory detail you can read aloud.

### Site (`site`)
- Group: Places. Layout family: place. Allowed parents: region, settlement, district. Children shown as: Places.
- Infobox: Type, Parent, Controlled by
- **Overview**: Description; History
- **The place**: Layout; Sensory details; Inhabitants
- **At the table** (GM only): First impression; What players can do; Getting there; Who is here [automatic: people here]; Hooks; Secrets; If the party does nothing
- Studio: An outdoor or improvised place: a camp, a crossing, a grove. Lenses: Location design, Scene writing. Checks: What happens here if the party does nothing?.

### Dungeon (`dungeon`)
- Group: Places. Layout family: place. Allowed parents: region, settlement, district. Children shown as: Levels.
- Infobox: Type, Parent, Controlled by, Threat, Level range
- **Overview**: Premise; History
- **Structure**: Approach; Spatial logic; Levels [automatic: children]; Sensory details
- **Occupants**: Inhabitants; Factions inside; Named people here [automatic: people here]
- **At the table** (GM only): First impression; Discoveries; Hazards and tension; Treasure; If the party does nothing
- Studio: A living space with logic, inhabitants, discoveries and consequences. Lenses: Living dungeon, Encounter design, Rules. Checks: What happens here if the party does nothing?; No chokepoints: key discoveries have three routes.

### Dungeon level (`level`)
- Group: Places. Layout family: place. Allowed parents: dungeon, level. Children shown as: Sub-levels.
- Infobox: Type, Parent, Depth
- **The level**: Description; Keyed areas; Sensory details
- **At the table** (GM only): Who is here; Hazards; Secrets
- Studio: One floor or section of a dungeon, with keyed areas. Lenses: Living dungeon, Encounter design. Checks: Every area has something to do or learn.

### Faction (`faction`)
- Group: Factions. Layout family: faction. Allowed parents: faction, deity. Children shown as: Branches.
- Infobox: Type, Parent, Leader, Headquarters, Scope, Allies, Rivals, Disposition to party
- **Overview**: History
- **Organisation**: Structure; Leadership; Members [automatic: members]; Assets and resources; Territories
- **Culture**: Culture and customs; Methods
- **Relations**: Relationships
- **At the table** (GM only): Goals; Current move; Hooks
- Studio: Goals turned into moves, offers, threats and a clock. Lenses: Faction operator, NPC & faction. Checks: The world does not wait: it has a move this arc.

### Deity / Religion (`deity`)
- Group: Beliefs. Layout family: doc. Allowed parents: deity. Children shown as: Deities and orders.
- Infobox: Domains, Parent, Symbol, Alignment, Holy day, Worshipped by
- **Faith**: Tenets and dogma; Worship and rites; Priesthood; Holy sites
- **Lore**: Myths; History
- **At the table** (GM only): In this campaign; Omens and signs
- Studio: Domains, dogma, worshippers and what faith looks like at the table. Lenses: Lore weaving, Lore continuity. Checks: Label canon, extrapolation and homebrew.

### Culture (`culture`)
- Group: Beliefs. Layout family: doc. Allowed parents: culture. Children shown as: Subcultures.
- Infobox: Found in, Parent, Language, Population, Related faction
- **Identity**: Values and ideals; Naming traditions; Language
- **Daily life**: Customs and etiquette; Dress; Food and drink; Art and architecture
- **Life and death**: Coming of age; Funerary customs
- **Place in the world**: History; How outsiders see them
- **At the table** (GM only): In this campaign
- Studio: Values, customs, names and how others see them. Lenses: Lore weaving. Checks: Shows up in play, not only in lore.

### Lore (`lore`)
- Group: World. Layout family: doc. Allowed parents: lore. Children shown as: Events.
- Infobox: Kind, Parent, When, Where, Involved
- **The event**: What happened; Causes
- **Memory**: What people believe; Consequences now
- **The truth** (GM only): The truth; Where it leads
- **At the table** (GM only): Signs at the table
- Studio: Events, eras and world truths, with belief and truth kept apart. Lenses: Lore weaving, Lore continuity. Checks: Belief differs from truth somewhere useful.

### NPC (`npc`)
- Group: People. Layout family: person.
- Infobox: Role, Ancestry, Age, Location, Faction, Status
- **Description**: Appearance; Personality
- **Story**: Who they are; History
- **Relationships**: Relationships; Carries [automatic: carried items]
- **At the table** (GM only): What they know; What they will do; What they won't do; Hooks; Stat basis
- Studio: People with wants, fears, voice and business of their own. Lenses: NPC & faction, Lore continuity, Rules. Checks: Carry prior business; Voice usable in one line.

### Player character (`pc`)
- Group: Party. Layout family: person.
- Infobox: Player, Class and level, Ancestry, Background, Status
- **Description**: Appearance; Personality
- **Story**: Background; Arc and open beats
- **Relationships**: Bonds; Carries [automatic: carried items]
- **At the table** (GM only): Hooks for the GM

### Party (`party`)
- Group: Party. Layout family: party.
- Infobox: Location, Goal, Reputation
- **The group**: Bonds; Tensions; Shared resources; Shared secrets

### Creature (`creature`)
- Group: Bestiary. Layout family: doc. Allowed parents: creature. Children shown as: Kinds.
- Infobox: Type, Parent, CR, Habitat, Stat basis, Rarity
- **Description**: Appearance
- **Ecology**: Why it is here; Ecology and diet; Behaviour; Society
- **At the table** (GM only): The situation it creates; How to run it
- Studio: Why it is here, what situation it creates, and how to run it. Lenses: Lore weaving, Encounter design, Rules. Checks: Checked against the ruleset's monster list.

### Magic item (`item`)
- Group: Items. Layout family: item.
- Infobox: Rarity, Kind, Attunement, Holder
- **Lore**: Why it matters; Description; History
- **Mechanics**: Effects; Rules basis
- **At the table** (GM only): How it is found or opened; Pressure it creates
- Studio: Story, mechanics and balance checked against the campaign ruleset. Lenses: Magic item design, Rules, Lore continuity. Checks: Balanced against the campaign ruleset; The item creates pressure, not only power.

### Rule reference (`rule`)
- Group: Rules. Layout family: rule. Allowed parents: rule. Children shown as: House rulings.
- Infobox: Source, Parent, Category
- **Rule**: Summary; At the table

### House ruling (`ruling`)
- Group: Rules. Layout family: doc. Allowed parents: rule.
- Infobox: Parent, Decided, Label
- **Ruling**: The ruling; Why

