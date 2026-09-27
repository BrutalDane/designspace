import { describe, it, expect } from "vitest";
import { childTypes, infoFields, ENTRY_TYPES, writtenFields } from "../src/lib/reference";
import { changedParts, parsePage } from "../src/lib/validation";
import { ancestors, buildTree } from "../src/lib/tree";

describe("entry types follow reference/wiki-page-design.md", () => {
  it("has the decided types built so far (the rest follow in slice 4)", () => {
    expect(Object.values(ENTRY_TYPES).map((t) => t.label)).toEqual([
      "World / Plane", "Region", "Settlement", "District", "Building / Landmark", "Site", "Dungeon",
      "Faction", "NPC", "Player character", "Party", "Magic item",
    ]);
  });
  it("uses the decided allowed parents", () => {
    expect(ENTRY_TYPES.world.parents).toEqual([]);
    expect(ENTRY_TYPES.region.parents).toEqual(["world", "region"]);
    expect(ENTRY_TYPES.settlement.parents).toEqual(["region"]);
    expect(ENTRY_TYPES.district.parents).toEqual(["settlement"]);
    expect(ENTRY_TYPES.building.parents).toEqual(["district", "settlement", "region"]);
    expect(ENTRY_TYPES.site.parents).toEqual(["region", "settlement", "district"]);
    expect(ENTRY_TYPES.dungeon.parents).toEqual(["region", "settlement", "district"]);
  });
  it("only a World / Plane starts the places; factions, people, party and items may sit at the top", () => {
    expect(childTypes(null)).toEqual(["world", "faction", "npc", "pc", "party", "item"]);
    expect(childTypes("faction")).toEqual(["faction"]);
    expect(childTypes("npc")).toEqual([]);
    expect(childTypes("world")).toEqual(["region"]);
    expect(childTypes("region")).toEqual(["region", "settlement", "building", "site", "dungeon"]);
    expect(childTypes("settlement")).toEqual(["district", "building", "site", "dungeon"]);
    expect(childTypes("district")).toEqual(["building", "site", "dungeon"]);
    expect(childTypes("site")).toEqual([]);
  });
  it("uses the decided groups, with At the table as the GM group", () => {
    expect(ENTRY_TYPES.region.groups.map((g) => g.name)).toEqual(["Overview", "The land", "People and powers", "Travel", "At the table"]);
    expect(ENTRY_TYPES.settlement.groups.map((g) => g.name)).toEqual(["Overview", "Society", "Economy", "Places", "Defence", "At the table"]);
    expect(ENTRY_TYPES.npc.extra!.map((f) => f.label)).toEqual(["Wants", "Fears", "Secret", "Voice"]);
    expect(ENTRY_TYPES.pc.extra!.map((f) => f.label)).toEqual(["Drive", "Burden", "Secret (GM)", "Voice"]);
    for (const t of Object.values(ENTRY_TYPES)) {
      expect(t.groups.filter((g) => g.gm).map((g) => g.name)).toEqual(t.fam === "party" ? [] : ["At the table"]);
      const keys = [...(t.extra ?? []), ...t.groups.flatMap((g) => g.fields)].map((f) => f.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
  it("has the decided infobox fields; Parent is the tree, not a typed field", () => {
    expect(infoFields("settlement")).toEqual(["Type", "Population", "Governance", "Economy", "Defence"]);
    expect(writtenFields("settlement").map((f) => f.key)).not.toContain("CHILDREN");
  });
});

describe("reading an edited page", () => {
  it("trims text, drops empty values and ignores fields from other types", () => {
    const r = parsePage("settlement", {
      title: " Vellumis ", lead: " A city of ledgers. ",
      info: { Population: " 12,000 ", Governance: " ", Terrain: "not a settlement field" },
      sections: { impression: " Bells at dusk. ", religion: "  ", premise: "not a settlement section" },
    });
    expect(r.success && r.data).toEqual({ title: "Vellumis", lead: "A city of ledgers.", info: { Population: "12,000" }, sections: { impression: "Bells at dusk." } });
  });
  it("needs a title", () => {
    const r = parsePage("world", { title: "  ", lead: "", info: {}, sections: {} });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Give the page a title.");
  });
});

describe("what changed between versions", () => {
  const v1 = { title: "Vellumis", lead: "A city.", info: {}, sections: { impression: "Bells." } };
  it("marks the first version as created", () => expect(changedParts("settlement", undefined, v1)).toEqual(["Created"]));
  it("names the changed parts in page order", () => {
    const v2 = { title: "Vellumis", lead: "A city of ledgers.", info: { Population: "12,000" }, sections: { impression: "Bells.", religion: "The Ledger God." } };
    expect(changedParts("settlement", v1, v2)).toEqual(["Lead", "Population", "Religion"]);
  });
});

describe("the tree of places", () => {
  const items = [
    { id: "w", parentId: null, title: "Faerûn" },
    { id: "r", parentId: "w", title: "The Grey Marches" },
    { id: "s2", parentId: "r", title: "Wardhold" },
    { id: "s1", parentId: "r", title: "Vellumis" },
  ];
  it("nests children under parents, sorted by title", () => {
    const [world] = buildTree(items);
    expect(world.children[0].children.map((c) => c.title)).toEqual(["Vellumis", "Wardhold"]);
  });
  it("finds the path from the top down", () => {
    expect(ancestors(items, "s1").map((a) => a.title)).toEqual(["Faerûn", "The Grey Marches"]);
    expect(ancestors(items, "w")).toEqual([]);
  });
});
