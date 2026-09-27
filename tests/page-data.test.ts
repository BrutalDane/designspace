import { describe, it, expect } from "vitest";
import { changedData, dataParts, parseData } from "../src/lib/page-data";

describe("structured parts of a page", () => {
  it("only threads have clocks, clues routes and dungeon levels keyed areas", () => {
    expect(dataParts("thread")).toEqual({ clock: true, routes: false, areas: false });
    expect(dataParts("clue")).toEqual({ clock: false, routes: true, areas: false });
    expect(dataParts("level")).toEqual({ clock: false, routes: false, areas: true });
    expect(dataParts("npc")).toEqual({ clock: false, routes: false, areas: false });
  });
  it("reads a clock from 0 to 5, or no clock", () => {
    expect(parseData("thread", { clockPos: "3", portent: " Wanted posters " }, {})).toEqual({ data: { clock: { pos: 3, portent: "Wanted posters" } } });
    expect(parseData("thread", { clockPos: "" }, {})).toEqual({ data: {} });
    expect(parseData("thread", { clockPos: "6" }, {})).toHaveProperty("error");
  });
  it("reads routes one per line and keeps found for routes that didn't change", () => {
    const before = { routes: [{ text: "The ledger", found: true }, { text: "The clerk", found: false }] };
    expect(parseData("clue", { routes: "The ledger\n\n The clerk's diary \n" }, before)).toEqual({
      data: { routes: [{ text: "The ledger", found: true }, { text: "The clerk's diary", found: false }] },
    });
  });
  it("drops empty keyed-area rows and ignores parts a type doesn't have", () => {
    const areas = [{ n: "1", area: "Ridge road", text: "Wheel ruts." }, { n: "", area: "", text: "" }];
    expect(parseData("level", { areas }, {})).toEqual({ data: { areas: [areas[0]] } });
    expect(parseData("npc", { clockPos: "2", areas }, {})).toEqual({ data: {} });
  });
  it("names what changed for the history", () => {
    expect(changedData({ clock: { pos: 1, portent: "" } }, { clock: { pos: 2, portent: "" }, routes: [{ text: "a", found: false }] })).toEqual(["Clock", "Routes"]);
  });
});
