import { describe, it, expect } from "vitest";
import { childTypes, PLACE_TYPES } from "../src/lib/reference";
import { changedParts, parsePage } from "../src/lib/validation";
import { ancestors, buildTree } from "../src/lib/tree";

describe("which places can go inside which", () => {
  it("allows the World → Region → Settlement → District → Site chain", () => {
    expect(childTypes(null)).toContain("world");
    expect(childTypes("world")).toContain("region");
    expect(childTypes("region")).toContain("settlement");
    expect(childTypes("settlement")).toContain("district");
    expect(childTypes("district")).toEqual(["site"]);
  });
  it("never offers nonsense nesting", () => {
    expect(childTypes("site")).toEqual([]);
    expect(childTypes("district")).not.toContain("settlement");
    expect(childTypes("world")).not.toContain("world");
    expect(childTypes(null)).not.toContain("district");
  });
  it("gives every layout unique section keys", () => {
    for (const t of Object.values(PLACE_TYPES)) expect(new Set(t.sections.map((s) => s.key)).size).toBe(t.sections.length);
  });
});

describe("reading an edited page", () => {
  it("trims text, drops empty sections and ignores sections from other layouts", () => {
    const r = parsePage("settlement", { title: " Larkwater ", summary: "", sections: { impression: " Fog and bells. ", tensions: "  ", premise: "not a settlement section" } });
    expect(r.success && r.data).toEqual({ title: "Larkwater", summary: "", sections: { impression: "Fog and bells." } });
  });
  it("needs a name", () => {
    const r = parsePage("world", { title: "  ", summary: "", sections: {} });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Give the page a name.");
  });
});

describe("what changed between versions", () => {
  const v1 = { title: "Larkwater", summary: "A fog town.", sections: { impression: "Bells." } };
  it("marks the first version as created", () => expect(changedParts("settlement", undefined, v1)).toEqual(["Created"]));
  it("names the changed parts in page order", () => {
    const v2 = { title: "Larkwater", summary: "A fog-bound town.", sections: { impression: "Bells.", tensions: "Rival guilds." } };
    expect(changedParts("settlement", v1, v2)).toEqual(["Summary", "Tensions"]);
  });
});

describe("the tree of places", () => {
  const items = [
    { id: "w", parentId: null, title: "Toril" },
    { id: "r", parentId: "w", title: "The Vale" },
    { id: "s2", parentId: "r", title: "Stonebridge" },
    { id: "s1", parentId: "r", title: "Larkwater" },
  ];
  it("nests children under parents, sorted by name", () => {
    const [world] = buildTree(items);
    expect(world.children[0].children.map((c) => c.title)).toEqual(["Larkwater", "Stonebridge"]);
  });
  it("finds the path from the top down", () => {
    expect(ancestors(items, "s1").map((a) => a.title)).toEqual(["Toril", "The Vale"]);
    expect(ancestors(items, "w")).toEqual([]);
  });
});
