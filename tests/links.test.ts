import { describe, it, expect } from "vitest";
import { linkIndex, linkTargets, pageText, parseText, toEditable, toStored } from "../src/lib/links";

const V = "11111111-1111-4111-8111-111111111111", G = "22222222-2222-4222-8222-222222222222";
const index = linkIndex([{ id: V, title: "Vellumis" }, { id: G, title: "The Grey Marches" }]);

describe("storing links", () => {
  it("turns typed titles into page ids, ignoring case, and keeps the shown text", () => {
    expect(toStored("See [[vellumis]] in [[The Grey Marches|the Marches]].", index)).toEqual({ text: `See [[${V}]] in [[${G}|the Marches]].`, ambiguous: [] });
  });
  it("keeps links to pages that don't exist yet as typed", () => {
    expect(toStored("Ask at [[The Drowned Bell]].", index).text).toBe("Ask at [[The Drowned Bell]].");
  });
  it("refuses to guess when two pages share a title", () => {
    const twins = linkIndex([{ id: V, title: "Bell Tower" }, { id: G, title: "bell tower" }]);
    expect(toStored("[[Bell Tower]]", twins).ambiguous).toEqual(["Bell Tower"]);
  });
  it("shows ids as current titles again in the editor, so renames carry through", () => {
    const renamed = linkIndex([{ id: V, title: "Vellumis-on-the-Marsh" }]);
    expect(toEditable(`[[${V}]] and [[${V}|the city]]`, renamed)).toBe("[[Vellumis-on-the-Marsh]] and [[Vellumis-on-the-Marsh|the city]]");
  });
});

describe("reading links", () => {
  it("finds the pages a page links to, by id or by title", () => {
    expect(linkTargets(`[[${V}]], [[The Grey Marches]] and [[Nowhere]]`, index).sort()).toEqual([V, G].sort());
  });
  it("reads links from lead, infobox and sections", () => {
    expect(pageText({ lead: "a", info: { Parent: "b" }, sections: { history: "c" } })).toBe("a\nb\nc");
  });
  it("never shows the title of a page outside the campaign", () => {
    const foreign = "33333333-3333-4333-8333-333333333333";
    const [p] = parseText(`[[${foreign}]]`, index);
    expect(p).toEqual({ kind: "p", lines: [[{ kind: "link", target: foreign, label: "unknown page", page: null }]] });
  });
});

describe("formatting, as in the prototype", () => {
  it("handles bold, italic, links, line breaks and lists", () => {
    const blocks = parseText(`**Bells** at *dusk* in [[Vellumis|the city]].\nSecond line.\n\n- one\n- two`, index);
    expect(blocks.map((b) => b.kind)).toEqual(["p", "ul"]);
    expect(blocks[0].kind === "p" && blocks[0].lines[0].map((x) => x.kind)).toEqual(["strong", "text", "em", "text", "link", "text"]);
    expect(blocks[0].kind === "p" && blocks[0].lines).toHaveLength(2);
    expect(blocks[1].kind === "ul" && blocks[1].items).toHaveLength(2);
  });
});
