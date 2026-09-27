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

/* ---------- Wiki: place types ----------
 * Copied from the decided reference (reference/wiki-page-design.md, from prototype-v6-types.js). Do not add or rename
 * sections, info fields or parents here without Thor's decision. Keys in CAPITALS are lists the app builds itself.
 * Dungeon level is decided but follows in a later slice (it needs keyed areas).
 */
export type PlaceType = "world" | "region" | "settlement" | "district" | "building" | "site" | "dungeon";
export type Field = { key: string; label: string };
export type Group = { name: string; fields: Field[]; gm: boolean };
export type PlaceTypeDef = { label: string; parents: PlaceType[]; kids: string; info: string[]; groups: Group[] };

/** Lists the app builds itself; never typed by hand and never listed as "not written yet". */
export const AUTO = ["CHILDREN", "PEOPLE", "AREAS"] as const;
export const isAuto = (key: string) => (AUTO as readonly string[]).includes(key);

const G = (name: string, fields: [string, string][], gm = false): Group => ({ name, fields: fields.map(([key, label]) => ({ key, label })), gm });

export const PLACE_TYPES: Record<PlaceType, PlaceTypeDef> = {
  world: {
    label: "World / Plane", parents: [], kids: "Regions", info: ["Type", "Parent"],
    groups: [
      G("Overview", [["description", "Description"], ["cosmology", "Cosmology"], ["history", "History"]]),
      G("Places", [["CHILDREN", "Regions"]]),
      G("At the table", [["campaign", "In this campaign"], ["secrets", "Secrets"]], true),
    ],
  },
  region: {
    label: "Region", parents: ["world", "region"], kids: "Places", info: ["Type", "Parent", "Terrain", "Climate", "Authority", "Population", "Danger"],
    groups: [
      G("Overview", [["description", "Description"], ["history", "History"]]),
      G("The land", [["geography", "Geography"], ["climate", "Climate and seasons"], ["flora", "Fauna and flora"], ["phenomena", "Local phenomena"], ["resources", "Natural resources"]]),
      G("People and powers", [["peoples", "Peoples and cultures"], ["power", "Who holds power"], ["CHILDREN", "Settlements and sites"], ["PEOPLE", "People here"]]),
      G("Travel", [["routes", "Roads and routes"], ["hazards", "Hazards"]]),
      G("At the table", [["impression", "First impression"], ["now", "What is happening now"], ["pressures", "Creature pressures"], ["rumours", "Rumours"], ["hooks", "Hooks"], ["secrets", "Secrets"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  settlement: {
    label: "Settlement", parents: ["region"], kids: "Districts and places", info: ["Type", "Parent", "Population", "Governance", "Economy", "Defence"],
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
    label: "District", parents: ["settlement"], kids: "Places", info: ["Type", "Parent", "Population", "Watch"],
    groups: [
      G("Overview", [["description", "Description"], ["character", "Character"], ["history", "History"]]),
      G("Life here", [["residents", "Who lives here"], ["factions", "Factions and networks"], ["CHILDREN", "Points of interest"]]),
      G("At the table", [["impression", "First impression"], ["now", "Current pressure"], ["PEOPLE", "Notable people here"], ["rumours", "Rumours"], ["hooks", "Hooks"], ["secrets", "Secrets"]], true),
    ],
  },
  building: {
    label: "Building / Landmark", parents: ["district", "settlement", "region"], kids: "Parts", info: ["Type", "Parent", "Owner", "Built"],
    groups: [
      G("Overview", [["description", "Description"], ["purpose", "Purpose"], ["history", "History"]]),
      G("Design", [["architecture", "Design and architecture"], ["layout", "Layout and rooms"], ["entries", "Entries and exits"], ["sensory", "Sensory details"]]),
      G("At the table", [["impression", "First impression"], ["PEOPLE", "Who is here"], ["rumours", "Rumours"], ["hooks", "Hooks"], ["secrets", "Secrets"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  site: {
    label: "Site", parents: ["region", "settlement", "district"], kids: "Places", info: ["Type", "Parent", "Controlled by"],
    groups: [
      G("Overview", [["description", "Description"], ["history", "History"]]),
      G("The place", [["layout", "Layout"], ["sensory", "Sensory details"], ["inhabitants", "Inhabitants"]]),
      G("At the table", [["impression", "First impression"], ["do", "What players can do"], ["nav", "Getting there"], ["PEOPLE", "Who is here"], ["hooks", "Hooks"], ["secrets", "Secrets"], ["ignored", "If the party does nothing"]], true),
    ],
  },
  dungeon: {
    label: "Dungeon", parents: ["region", "settlement", "district"], kids: "Levels", info: ["Type", "Parent", "Controlled by", "Threat", "Level range"],
    groups: [
      G("Overview", [["premise", "Premise"], ["history", "History"]]),
      G("Structure", [["approach", "Approach"], ["logic", "Spatial logic"], ["CHILDREN", "Levels"], ["sensory", "Sensory details"]]),
      G("Occupants", [["inhabitants", "Inhabitants"], ["factions", "Factions inside"], ["PEOPLE", "Named people here"]]),
      G("At the table", [["impression", "First impression"], ["discoveries", "Discoveries"], ["hazards", "Hazards and tension"], ["treasure", "Treasure"], ["ignored", "If the party does nothing"]], true),
    ],
  },
};

/** Image slot label in the infobox, per type (from the prototype). */
export const INFOBOX_IMAGE: Partial<Record<PlaceType, string>> = { region: "Map", settlement: "Map", building: "Illustration", site: "Map", dungeon: "Map" };

export const isPlaceType = (t: string): t is PlaceType => Object.hasOwn(PLACE_TYPES, t);
/** The typed sections of a type, in page order (automatic lists left out). */
export const writtenFields = (t: PlaceType) => PLACE_TYPES[t].groups.flatMap((g) => g.fields).filter((f) => !isAuto(f.key));
/** Infobox fields the GM types. "Parent" is the page's place in the tree, not a typed field. */
export const infoFields = (t: PlaceType) => PLACE_TYPES[t].info.filter((k) => k !== "Parent");
/** Which types may go inside a parent of the given type (null = the top of the Wiki: types with no allowed parents). */
export const childTypes = (parent: PlaceType | null): PlaceType[] =>
  (Object.keys(PLACE_TYPES) as PlaceType[]).filter((t) => (parent ? PLACE_TYPES[t].parents.includes(parent) : PLACE_TYPES[t].parents.length === 0));
