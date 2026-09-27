import { describe, it, expect } from "vitest";
import { carries, members, partyMembers, peopleHere, refId } from "../src/lib/auto-lists";
import type { EntryType } from "../src/lib/reference";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const page = (n: number, type: EntryType, parent: number | null = null, info: Record<string, string> = {}) =>
  ({ id: id(n), parentId: parent === null ? null : id(parent), type, info });
const ref = (n: number) => `[[${id(n)}]]`;

const pages = [
  page(1, "settlement"), page(2, "district", 1), page(3, "building", 2),
  page(10, "faction"), page(11, "faction", 10),
  page(20, "npc", null, { Location: ref(3), Faction: ref(11) }),   // in a building, in a branch
  page(21, "npc", null, { Location: ref(1) }),
  page(22, "pc", null, { Location: ref(2) }),
  page(23, "npc"),
  page(30, "item", null, { Holder: ref(22) }), page(31, "item", null, { Holder: ref(20) }),
];

describe("lists that build themselves", () => {
  it("People here: anyone whose Location is this place or anywhere inside it", () => {
    expect(peopleHere(pages, id(1)).map((p) => p.id)).toEqual([id(20), id(21), id(22)]);
    expect(peopleHere(pages, id(2)).map((p) => p.id)).toEqual([id(20), id(22)]);
    expect(peopleHere(pages, id(3)).map((p) => p.id)).toEqual([id(20)]);
  });
  it("Members: NPCs whose Faction is this faction or one of its branches", () => {
    expect(members(pages, id(10)).map((p) => p.id)).toEqual([id(20)]);
    expect(members(pages, id(11)).map((p) => p.id)).toEqual([id(20)]);
  });
  it("Carries: items whose Holder is this person", () => {
    expect(carries(pages, id(22)).map((p) => p.id)).toEqual([id(30)]);
  });
  it("the party's members are the player characters", () => {
    expect(partyMembers(pages).map((p) => p.id)).toEqual([id(22)]);
  });
  it("only a whole [[id]] counts as a reference", () => {
    expect(refId(ref(3))).toBe(id(3));
    expect(refId(`near ${ref(3)}`)).toBeNull();
    expect(refId("Vellumis")).toBeNull();
  });
});
