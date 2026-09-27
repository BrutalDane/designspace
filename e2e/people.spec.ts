import { test, expect, type Page } from "@playwright/test";
import { signIn, noSeriousA11yIssues, openEditor, save } from "./helpers";

async function newPage(page: Page, kind: string, title: string) {
  await page.goto(page.url().replace(/\/wiki.*$/, "/wiki/new"));
  await page.getByRole("radio", { name: kind, exact: true }).check();
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Create page" }).click();
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
}

test("people, factions, the party and items, with the lists that build themselves", async ({ page }) => {
  await signIn(page);
  await page.getByLabel("Name").fill("People test");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/wiki$/);

  // Places: Faerûn › The Grey Marches › Vellumis
  await newPage(page, "World / Plane", "Faerûn");
  for (const [kind, title] of [["Region", "The Grey Marches"], ["Settlement", "Vellumis"]]) {
    await page.getByRole("link", { name: /Add a place inside/ }).click();
    await page.getByRole("radio", { name: kind }).check();
    await page.getByLabel("Title").fill(title);
    await page.getByRole("button", { name: "Create page" }).click();
    await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  }

  // A faction with a branch
  await newPage(page, "Faction", "The Marchwardens");
  await openEditor(page);
  await page.getByLabel("Public face").fill("Keepers of the border roads.");
  await page.getByLabel("Hidden truth").fill("They sell safe passage.");
  await save(page);
  await expect(page.getByText("Hidden truth · GM")).toBeVisible();
  await expect(page.getByText("They sell safe passage.")).toBeVisible();
  await noSeriousA11yIssues(page); // faction layout: public face and hidden truth
  await page.getByRole("link", { name: "Add a page inside The Marchwardens" }).click();
  await expect(page.locator(".kind-option")).toHaveText(["Faction"]);
  await page.getByLabel("Title").fill("The Wardhold garrison");
  await page.getByRole("button", { name: "Create page" }).click();
  await expect(page.getByRole("heading", { name: "The Wardhold garrison", level: 1 })).toBeVisible();

  // An NPC in Vellumis, in the branch; chosen from lists, never typed as links
  await newPage(page, "NPC", "Maret Holwick");
  await expect(page.locator(".mono-badge").first()).toHaveText("MH");
  await openEditor(page);
  await page.getByLabel("Role").fill("Warden captain");
  await page.getByLabel("Location").selectOption({ label: "Vellumis · Settlement" });
  await page.getByRole("combobox", { name: "Faction", exact: true }).selectOption({ label: "The Wardhold garrison · Faction" });
  await page.getByLabel("Wants").fill("A quiet border.");
  await page.getByLabel("Fears").fill("Being found out.");
  await page.getByLabel("Voice").fill("Keep to the road and you keep your coin.");
  await save(page);
  await expect(page.locator(".tri.want")).toContainText("A quiet border.");
  await expect(page.locator(".tri.secret")).toContainText("Not set");
  await expect(page.getByText("Keep to the road and you keep your coin.")).toBeVisible();
  await noSeriousA11yIssues(page); // person layout: badge, triad, voice
  const infobox = page.getByRole("complementary", { name: "Infobox" });
  await expect(infobox.getByRole("link", { name: "Vellumis" })).toBeVisible();

  // A player character and the party
  await newPage(page, "Player character", "Ilsa Brand");
  await openEditor(page);
  await page.getByLabel("Player").fill("Thor");
  await page.getByLabel("Class and level").fill("Ranger 3");
  await save(page);
  await expect(page.locator(".mono-badge.pc").first()).toHaveText("IB");
  await newPage(page, "Party", "The Lantern Company");
  await expect(page.getByRole("region", { name: "Members" }).getByRole("link", { name: "Ilsa Brand" })).toBeVisible();
  await noSeriousA11yIssues(page); // party layout: members

  // An item Maret carries
  await newPage(page, "Magic item", "Lantern of the Deep Road");
  await openEditor(page);
  await page.getByLabel("Rarity").fill("Uncommon");
  await page.getByLabel("Holder").selectOption({ label: "Maret Holwick · NPC" });
  await page.getByLabel("Effects").fill("Sheds light that only the holder can see.");
  await save(page);
  await expect(page.locator(".item-top")).toContainText("Uncommon");
  await expect(page.locator(".mech")).toContainText("Sheds light");
  await noSeriousA11yIssues(page); // item layout: pills and mechanics box

  // The lists that build themselves
  const tree = page.getByRole("navigation", { name: "Campaign pages" });
  await expect(tree.locator(".gh")).toHaveText(["Campaign", "Places3", "Factions2", "People1", "Party2", "Items1"]);
  await tree.getByRole("link", { name: "Maret Holwick" }).click();
  await expect(page.getByRole("region", { name: "Carries" }).getByRole("link", { name: "Lantern of the Deep Road" })).toBeVisible();
  await page.getByRole("complementary", { name: "Infobox" }).getByRole("link", { name: "Vellumis" }).click();
  await expect(page.getByRole("region", { name: "Notable people here" }).getByRole("link", { name: "Maret Holwick" })).toBeVisible();
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "The Grey Marches" }).click();
  await expect(page.getByRole("region", { name: "People here" }).getByRole("link", { name: "Maret Holwick" })).toBeVisible(); // anywhere inside
  await tree.getByRole("link", { name: "The Marchwardens" }).click();
  await expect(page.getByRole("region", { name: "Members" }).getByRole("link", { name: "Maret Holwick" })).toBeVisible(); // via the branch
});
