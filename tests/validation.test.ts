import { describe, it, expect } from "vitest";
import { CampaignInput, SignInInput } from "../src/lib/validation";

describe("CampaignInput", () => {
  it("accepts a normal campaign and trims text", () => {
    const r = CampaignInput.parse({ name: "  The Grey Marches ", setting: " Faerûn ", ruleset: "dnd2014", calendar: "harptos" });
    expect(r).toEqual({ name: "The Grey Marches", setting: "Faerûn", ruleset: "dnd2014", calendar: "harptos" });
  });
  it("rejects a missing name with a plain message", () => {
    const r = CampaignInput.safeParse({ name: " ", ruleset: "dnd2014", calendar: "harptos" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/at least 2 characters/);
  });
  it("rejects rulesets that are not installed", () => {
    expect(CampaignInput.safeParse({ name: "X Y", ruleset: "gurps", calendar: "harptos" }).success).toBe(false);
  });
});

describe("SignInInput", () => {
  it("requires an email and a password", () => {
    expect(SignInInput.safeParse({ email: "nope", password: "" }).success).toBe(false);
    expect(SignInInput.safeParse({ email: "gm@example.test", password: "x" }).success).toBe(true);
  });
});
