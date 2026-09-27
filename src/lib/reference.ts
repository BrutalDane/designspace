/** Reference data that is part of the product, not user content: rulesets, calendars, workspaces and entry types. */
export const RULESETS: Record<string, { name: string; short: string }> = {
  dnd2014: { name: "Dungeons & Dragons 5e (2014)", short: "D&D 2014" },
};
export const CALENDARS: Record<string, { name: string }> = {
  harptos: { name: "Calendar of Harptos" },
  simple: { name: "Simple 12 × 30" },
};
export const WORKSPACES = [
  { slug: "wiki", label: "Wiki" },
  { slug: "build", label: "Worldbuilding" },
  { slug: "sessions", label: "Sessions" },
] as const;

/* ---------- Wiki: entry types ----------
 * Copied from the decided reference (reference/wiki-page-design.md, from prototype-v6-types.js). Do not add or rename
 * sections, info fields or parents here without Thor's decision. Keys in CAPITALS are lists the app builds itself.
 * All 22 decided types except Campaign State, which is the Wiki's front page rather than a page type of its own.
 */
export type EntryType = "world" | "region" | "settlement" | "district" | "building" | "site" | "dungeon" | "level"
  | "npc" | "pc" | "party" | "faction" | "item"
  | "arc" | "thread" | "clue" | "deity" | "culture" | "lore" | "creature" | "rule" | "ruling";
export type Family = "place" | "person" | "faction" | "party" | "item" | "front" | "clue" | "rule" | "doc";
export type Field = { key: string; label: string };
export type Group = { name: string; fields: Field[]; gm: boolean };
export type TypeDef = {
  label: string;
  group: string;          // type group in the tree (Places, People, …)
  fam: Family;            // layout family: extra elements on top of the common page anatomy
  parents: EntryType[];   // allowed parents (empty: never has a parent)
  root: boolean;          // may sit at the top of its hierarchy with no parent
  kids?: string;          // how its children are listed
  info: string[];         // infobox fields ("Parent" is the tree position, not typed)
  extra?: Field[];        // family fields shown above the groups (triad, voice, public face…)
  groups: Group[];
};

/** Lists the app builds itself; never typed by hand and never listed as "not written yet". */
export const AUTO = ["CHILDREN", "PEOPLE", "AREAS", "MEMBERS", "CARRIES"] as const;
export const isAuto = (key: string) => (AUTO as readonly string[]).includes(key);

const G = (name: string, fields: [string, string][], gm = false): Group => ({ name, fields: fields.map(([key, label]) => ({ key, label })), gm });
const F = (fields: [string, string][]): Field[] => fields.map(([key, label]) => ({ key, label }));
const place = { group: "Places", fam: "place" as const, root: false };

export const ENTRY_TYPES: Record<EntryType, TypeDef> = {
  world: {
    ...place, root: true, label: "World / Plane", parents: [], kids: "Regions", info: ["Type", "Parent"],
    groups: [
      G("Overview", [["description", "Description"], ["cosmology", "Cosmology"], ["history", "History"]]),
      G("Places", [["CHILDREN", "Regions"]]),
      G("At the table", [["campaign", "In this campaign"], ["secrets", "Secrets"]], true),
    ],
  },
  region: {
    ...place, label: "Region", parents: ["world", "region"], kids: "Places", info: ["Type", "Parent", "Terrain", "Climate", "Authority", "Population", "Danger"],
    groups: [
      G("Overview", [["description", "Description"], ["history", "History"]]),
      G("The land", [["geography", "Geography"], ["climate", "Climate and seasons"], ["flora", "Fauna and flora"], ["phenomena", "Local phenomena"], ["resources", "Natural resources"]]),
      G("People and powers", [["peoples", "Peoples and cultures"], ["power", "Who holds power"], ["CHILDREN", "Settlements and sites"], ["PEOPLE", "People here"]]),
      G("Travel", [["routes", "Roads and routes"], ["hazards", "Hazards"]]),
      G("At the table", [["impression", "First impression"], ["now", "What is happening now"], ["pressures", "Creature pressures"], ["rumours", "Rumours"], ["hooks", "Hooks"], ["secrets", "Secrets"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  settlement: {
    ...place, label: "Settlement", parents: ["region"], kids: "Districts and places", info: ["Type", "Parent", "Population", "Governance", "Economy", "Defence"],
    groups: [
      G("Overview", [["description", "Description"], ["history", "History"]]),
      G("Society", [["demographics", "Demographics"], ["government", "Government"], ["culture", "Culture and customs"], ["religion", "Religion"], ["factions", "Factions and guilds"]]),
      G("Economy", [["industry", "Industry and trade"], ["infrastructure", "Infrastructure"]]),
      G("Places", [["districts", "Districts"], ["CHILDREN", "Districts and points of interest"], ["architecture", "Architecture"], ["surroundings", "Surroundings"]]),
      G("Defence", [["defences", "Defences"]]),
      G("At the table", [["impression", "First impression"], ["now", "Current situation"], ["PEOPLE", "Notable people here"], ["rumours", "Rumours"], ["hooks", "Hooks"], ["secrets", "Secrets"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  district: {
    ...place, label: "District", parents: ["settlement"], kids: "Places", info: ["Type", "Parent", "Population", "Watch"],
    groups: [
      G("Overview", [["description", "Description"], ["character", "Character"], ["history", "History"]]),
      G("Life here", [["residents", "Who lives here"], ["factions", "Factions and networks"], ["CHILDREN", "Points of interest"]]),
      G("At the table", [["impression", "First impression"], ["now", "Current pressure"], ["PEOPLE", "Notable people here"], ["rumours", "Rumours"], ["hooks", "Hooks"], ["secrets", "Secrets"]], true),
    ],
  },
  building: {
    ...place, label: "Building / Landmark", parents: ["district", "settlement", "region"], kids: "Parts", info: ["Type", "Parent", "Owner", "Built"],
    groups: [
      G("Overview", [["description", "Description"], ["purpose", "Purpose"], ["history", "History"]]),
      G("Design", [["architecture", "Design and architecture"], ["layout", "Layout and rooms"], ["entries", "Entries and exits"], ["sensory", "Sensory details"]]),
      G("At the table", [["impression", "First impression"], ["PEOPLE", "Who is here"], ["rumours", "Rumours"], ["hooks", "Hooks"], ["secrets", "Secrets"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  site: {
    ...place, label: "Site", parents: ["region", "settlement", "district"], kids: "Places", info: ["Type", "Parent", "Controlled by"],
    groups: [
      G("Overview", [["description", "Description"], ["history", "History"]]),
      G("The place", [["layout", "Layout"], ["sensory", "Sensory details"], ["inhabitants", "Inhabitants"]]),
      G("At the table", [["impression", "First impression"], ["do", "What players can do"], ["nav", "Getting there"], ["PEOPLE", "Who is here"], ["hooks", "Hooks"], ["secrets", "Secrets"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  dungeon: {
    ...place, label: "Dungeon", parents: ["region", "settlement", "district"], kids: "Levels", info: ["Type", "Parent", "Controlled by", "Threat", "Level range"],
    groups: [
      G("Overview", [["premise", "Premise"], ["history", "History"]]),
      G("Structure", [["approach", "Approach"], ["logic", "Spatial logic"], ["CHILDREN", "Levels"], ["sensory", "Sensory details"]]),
      G("Occupants", [["inhabitants", "Inhabitants"], ["factions", "Factions inside"], ["PEOPLE", "Named people here"]]),
      G("At the table", [["impression", "First impression"], ["discoveries", "Discoveries"], ["hazards", "Hazards and tension"], ["treasure", "Treasure"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  level: {
    ...place, label: "Dungeon level", parents: ["dungeon", "level"], kids: "Sub-levels", info: ["Type", "Parent", "Depth"],
    groups: [
      G("The level", [["description", "Description"], ["AREAS", "Keyed areas"], ["sensory", "Sensory details"]]),
      G("At the table", [["inhabitants", "Who is here"], ["hazards", "Hazards"], ["secrets", "Secrets"]], true),
    ],
  },
  faction: {
    label: "Faction", group: "Factions", fam: "faction", root: true, parents: ["faction", "deity"], kids: "Branches",
    info: ["Type", "Parent", "Leader", "Headquarters", "Scope", "Allies", "Rivals", "Disposition to party"],
    extra: F([["public", "Public face"], ["hidden", "Hidden truth"], ["willdo", "Will do"], ["wont", "Won't do"]]),
    groups: [
      G("Overview", [["history", "History"]]),
      G("Organisation", [["structure", "Structure"], ["leaders", "Leadership"], ["MEMBERS", "Members"], ["resources", "Assets and resources"], ["territories", "Territories"]]),
      G("Culture", [["culture", "Culture and customs"], ["methods", "Methods"]]),
      G("Relations", [["relations", "Relationships"]]),
      G("At the table", [["goals", "Goals"], ["move", "Current move"], ["hooks", "Hooks"]], true),
    ],
  },
  npc: {
    label: "NPC", group: "People", fam: "person", root: true, parents: [], info: ["Role", "Ancestry", "Age", "Location", "Faction", "Status"],
    extra: F([["want", "Wants"], ["fear", "Fears"], ["secret", "Secret"], ["voice", "Voice"]]),
    groups: [
      G("Description", [["appearance", "Appearance"], ["personality", "Personality"]]),
      G("Story", [["who", "Who they are"], ["history", "History"]]),
      G("Relationships", [["bonds", "Relationships"], ["CARRIES", "Carries"]]),
      G("At the table", [["knows", "What they know"], ["will", "What they will do"], ["wont", "What they won't do"], ["hooks", "Hooks"], ["stats", "Stat basis"]], true),
    ],
  },
  pc: {
    label: "Player character", group: "Party", fam: "person", root: true, parents: [], info: ["Player", "Class and level", "Ancestry", "Background", "Status"],
    extra: F([["drive", "Drive"], ["burden", "Burden"], ["secret", "Secret (GM)"], ["voice", "Voice"]]),
    groups: [
      G("Description", [["appearance", "Appearance"], ["personality", "Personality"]]),
      G("Story", [["background", "Background"], ["arc", "Arc and open beats"]]),
      G("Relationships", [["bonds", "Bonds"], ["CARRIES", "Carries"]]),
      G("At the table", [["hooks", "Hooks for the GM"]], true),
    ],
  },
  party: {
    label: "Party", group: "Party", fam: "party", root: true, parents: [], info: ["Location", "Goal", "Reputation"],
    groups: [G("The group", [["bonds", "Bonds"], ["tensions", "Tensions"], ["resources", "Shared resources"], ["secrets", "Shared secrets"]])],
  },
  item: {
    label: "Magic item", group: "Items", fam: "item", root: true, parents: [], info: ["Rarity", "Kind", "Attunement", "Holder"],
    groups: [
      G("Lore", [["story", "Why it matters"], ["look", "Description"], ["history", "History"]]),
      G("Mechanics", [["effects", "Effects"], ["rules", "Rules basis"]]),
      G("At the table", [["found", "How it is found or opened"], ["pressure", "Pressure it creates"]], true),
    ],
  },
  arc: {
    label: "Arc", group: "Threads", fam: "doc", root: true, parents: [], kids: "Threads", info: ["Phase", "Theme"],
    groups: [
      G("The arc", [["conflict", "Core conflict"], ["theme", "Theme and questions"], ["acts", "Acts"]]),
      G("Stakes", [["unresolved", "If unresolved"], ["badly", "If resolved badly"]], true),
    ],
  },
  thread: {
    label: "Thread / Front", group: "Threads", fam: "front", root: false, parents: ["arc"], kids: "Clues", info: ["Status", "Parent", "Pressure", "Driven by"],
    groups: [
      G("The front", [["impulse", "Impulse: why it moves"], ["portents", "Portents"], ["doom", "If ignored"]]),
      G("At the table", [["signs", "Visible signs"], ["next", "Next beat"], ["use", "GM use"]], true),
    ],
  },
  clue: {
    label: "Clue / Revelation", group: "Threads", fam: "clue", root: false, parents: ["thread"], info: [],
    groups: [G("The revelation", [["truth", "The truth it reveals"], ["points", "What it points toward"]])],
  },
  deity: {
    label: "Deity / Religion", group: "Beliefs", fam: "doc", root: true, parents: ["deity"], kids: "Deities and orders",
    info: ["Domains", "Parent", "Symbol", "Alignment", "Holy day", "Worshipped by"],
    groups: [
      G("Faith", [["dogma", "Tenets and dogma"], ["worship", "Worship and rites"], ["priesthood", "Priesthood"], ["holy", "Holy sites"]]),
      G("Lore", [["myths", "Myths"], ["history", "History"]]),
      G("At the table", [["campaign", "In this campaign"], ["signs", "Omens and signs"]], true),
    ],
  },
  culture: {
    label: "Culture", group: "Beliefs", fam: "doc", root: true, parents: ["culture"], kids: "Subcultures",
    info: ["Found in", "Parent", "Language", "Population", "Related faction"],
    groups: [
      G("Identity", [["values", "Values and ideals"], ["names", "Naming traditions"], ["language", "Language"]]),
      G("Daily life", [["customs", "Customs and etiquette"], ["dress", "Dress"], ["food", "Food and drink"], ["art", "Art and architecture"]]),
      G("Life and death", [["coming", "Coming of age"], ["funerary", "Funerary customs"]]),
      G("Place in the world", [["history", "History"], ["outsiders", "How outsiders see them"]]),
      G("At the table", [["campaign", "In this campaign"]], true),
    ],
  },
  lore: {
    label: "Lore", group: "World", fam: "doc", root: true, parents: ["lore"], kids: "Events", info: ["Kind", "Parent", "When", "Where", "Involved"],
    groups: [
      G("The event", [["happened", "What happened"], ["causes", "Causes"]]),
      G("Memory", [["believe", "What people believe"], ["now", "Consequences now"]]),
      G("The truth", [["truth", "The truth"], ["leads", "Where it leads"]], true),
      G("At the table", [["signs", "Signs at the table"]], true),
    ],
  },
  creature: {
    label: "Creature", group: "Bestiary", fam: "doc", root: true, parents: ["creature"], kids: "Kinds",
    info: ["Type", "Parent", "CR", "Habitat", "Stat basis", "Rarity"],
    groups: [
      G("Description", [["appearance", "Appearance"]]),
      G("Ecology", [["why", "Why it is here"], ["ecology", "Ecology and diet"], ["behaviour", "Behaviour"], ["society", "Society"]]),
      G("At the table", [["situation", "The situation it creates"], ["run", "How to run it"]], true),
    ],
  },
  rule: {
    label: "Rule reference", group: "Rules", fam: "rule", root: true, parents: ["rule"], kids: "House rulings", info: ["Source", "Parent", "Category"],
    groups: [G("Rule", [["summary", "Summary"], ["table", "At the table"]])],
  },
  ruling: {
    label: "House ruling", group: "Rules", fam: "doc", root: false, parents: ["rule"], info: ["Parent", "Decided", "Label"],
    groups: [G("Ruling", [["ruling", "The ruling"], ["why", "Why"]])],
  },
};

/** Type groups in tree order (from the prototype); only groups with pages appear. */
export const GROUP_ORDER = ["Campaign", "Threads", "Places", "Factions", "People", "Party", "Beliefs", "World", "Bestiary", "Items", "Rules"];
export const PLACE_TYPES = (Object.keys(ENTRY_TYPES) as EntryType[]).filter((t) => ENTRY_TYPES[t].fam === "place");

/**
 * Infobox fields that point at another page, and which types they may point at. The editor offers a list of those
 * pages (the GM never types links); they drive the automatic lists People here, Members, Carries and Clocks.
 */
export const REF_FIELDS: Record<string, EntryType[]> = { Location: PLACE_TYPES, Faction: ["faction"], Holder: ["npc", "pc"], "Driven by": ["npc", "faction"] };

/** Image slot label in the infobox, per type (from the prototype). */
export const INFOBOX_IMAGE: Partial<Record<EntryType, string>> = {
  region: "Map", settlement: "Map", building: "Illustration", site: "Map", dungeon: "Map",
  npc: "Portrait", pc: "Portrait", faction: "Emblem", item: "Illustration", deity: "Holy symbol", culture: "Illustration", creature: "Illustration", lore: "Illustration",
};

/** Everything written as text on a page of this type, in editor order: family fields, then sections (lists left out). */
export const writtenFields = (t: EntryType) => [...(ENTRY_TYPES[t].extra ?? []), ...ENTRY_TYPES[t].groups.flatMap((g) => g.fields).filter((f) => !isAuto(f.key))];
/** Infobox fields the GM fills. "Parent" is the page's place in the tree, not a typed field. */
export const infoFields = (t: EntryType) => ENTRY_TYPES[t].info.filter((k) => k !== "Parent");
/** Which types may go inside a parent of the given type (null: types that may sit at the top). */
export const childTypes = (parent: EntryType | null): EntryType[] =>
  (Object.keys(ENTRY_TYPES) as EntryType[]).filter((t) => (parent ? ENTRY_TYPES[t].parents.includes(parent) : ENTRY_TYPES[t].root));
