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

/* ---------- Wiki: places ---------- */
export type Section = { key: string; heading: string; hint: string };
export type PlaceType = "world" | "region" | "settlement" | "district" | "site";

/**
 * Each kind of place has its own page layout. Sections are prompts, not required fields:
 * empty ones stay hidden on the page. `parents` lists what a place can sit inside (null = top of the tree).
 */
export const PLACE_TYPES: Record<PlaceType, { label: string; hint: string; parents: (PlaceType | null)[]; sections: Section[] }> = {
  world: {
    label: "World", hint: "The whole setting: a world, plane or continent.", parents: [null],
    sections: [
      { key: "feel", heading: "What it feels like", hint: "The tone and texture of the setting in a few lines." },
      { key: "powers", heading: "Gods and powers", hint: "Who or what holds power over the world, seen and unseen." },
      { key: "history", heading: "Ages and history", hint: "The eras that shaped it and what people remember of them." },
      { key: "peoples", heading: "Peoples and cultures", hint: "Who lives here and how they see each other." },
      { key: "changing", heading: "What is changing", hint: "The forces in motion as the campaign begins." },
    ],
  },
  region: {
    label: "Region", hint: "A land, province, wilderness or sea.", parents: [null, "world", "region"],
    sections: [
      { key: "character", heading: "Character", hint: "Landscape, climate and how it feels to travel here." },
      { key: "routes", heading: "Routes and travel", hint: "Roads, rivers, borders and how long journeys take." },
      { key: "communities", heading: "Communities", hint: "Who lives here, and where." },
      { key: "history", heading: "History and myths", hint: "What happened here and what people believe happened." },
      { key: "pressures", heading: "Active pressures", hint: "Conflicts, threats and changes under way." },
      { key: "hooks", heading: "Hooks for play", hint: "What could draw the party here or keep them here." },
    ],
  },
  settlement: {
    label: "Settlement", hint: "A city, town, village or outpost.", parents: [null, "world", "region"],
    sections: [
      { key: "impression", heading: "First impression", hint: "What travellers see, hear and smell as they arrive." },
      { key: "landmarks", heading: "Districts and landmarks", hint: "How the place is laid out and what stands out." },
      { key: "people", heading: "People and groups", hint: "Who runs it, who works it, who is left out." },
      { key: "customs", heading: "Customs and laws", hint: "Faiths, festivals, rules and what gets you in trouble." },
      { key: "tensions", heading: "Tensions", hint: "Rivalries, shortages and quarrels simmering under the surface." },
      { key: "services", heading: "Services", hint: "Where to sleep, eat, trade, heal and learn." },
      { key: "secrets", heading: "Secrets", hint: "What the locals hide, and from whom." },
      { key: "now", heading: "Current developments", hint: "What is happening here right now." },
    ],
  },
  district: {
    label: "District", hint: "A quarter, ward or neighbourhood of a settlement.", parents: ["settlement"],
    sections: [
      { key: "character", heading: "Character", hint: "Streets, sounds and the kind of people you meet." },
      { key: "places", heading: "Places to visit", hint: "Shops, taverns, temples and landmarks worth a scene." },
      { key: "people", heading: "Who holds sway", hint: "Bosses, guilds, families and watchers." },
      { key: "tensions", heading: "Tensions", hint: "What could spark trouble here." },
      { key: "secrets", heading: "Secrets", hint: "What is hidden behind the doors." },
    ],
  },
  site: {
    label: "Site", hint: "A building, ruin, dungeon or landmark.", parents: ["world", "region", "settlement", "district"],
    sections: [
      { key: "premise", heading: "Premise", hint: "What this place is, who made it, and why it matters now." },
      { key: "approach", heading: "Approach and entrances", hint: "How the party finds it and gets in." },
      { key: "atmosphere", heading: "Atmosphere", hint: "Light, sound, smell and mood." },
      { key: "inhabitants", heading: "Inhabitants", hint: "Who or what is here, and what they want." },
      { key: "discoveries", heading: "Discoveries and clues", hint: "What can be learned or found." },
      { key: "hazards", heading: "Hazards and obstacles", hint: "Traps, locks, guards and other ways in or around." },
      { key: "consequences", heading: "Consequences", hint: "How the place reacts to intruders and what changes after." },
      { key: "table", heading: "At the table", hint: "Quick reference for running it: read-aloud lines, DCs, reminders." },
    ],
  },
};

export const isPlaceType = (t: string): t is PlaceType => Object.hasOwn(PLACE_TYPES, t);
/** Which kinds of place may go inside a parent of the given kind (null = the top of the Wiki). */
export const childTypes = (parent: PlaceType | null): PlaceType[] =>
  (Object.keys(PLACE_TYPES) as PlaceType[]).filter((t) => PLACE_TYPES[t].parents.includes(parent));
