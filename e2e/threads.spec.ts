import { test, expect, type Page } from "@playwright/test";
import { signIn, noSeriousA11yIssues } from "./helpers";

async function create(page: Page, kind: string, title: string, inside?: string) {
  if (inside) await page.getByRole("link", { name: `Add a page inside ${inside}` }).or(page.getByRole("link", { name: `Add a place inside ${inside}` })).click();
  else await page.goto(page.url().replace(/\/wiki.*$/, "/wiki/new"));
  await page.getByRole("radio", { name: kind, exact: true }).check();
  await page.getByLabel("Title").fill(title);
  await page.getByRole("button", { name: "Create page" }).click();
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
}
async function openEditor(page: Page) {
  await page.getByRole("link", { name: "Edit" }).click();
  await expect(page.getByText(/^Editing directly/)).toBeVisible();
}
async function save(page: Page) {
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("link", { name: "Edit" })).toBeVisible();
}

test("threads with clocks, clues with routes, and Campaign State", async ({ page }) => {
  await signIn(page);
  await page.getByLabel("Name").fill("Threads test");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/wiki$/);
  await expect(page.getByRole("heading", { name: "Campaign State", level: 1 })).toBeVisible();

  await create(page, "Faction", "The Quiet Roads");
  await create(page, "Arc", "The Witness");
  await create(page, "Thread / Front", "Varik Regroups", "The Witness");
  await openEditor(page);
  await page.getByLabel("Filled segments").selectOption("3");
  await page.getByLabel("Next portent").fill("Wanted posters in Vellumis");
  await page.getByRole("combobox", { name: "Driven by" }).selectOption({ label: "The Quiet Roads · Faction" });
  await page.getByLabel("Impulse: why it moves").fill("Varik wants his men back.");
  await page.getByLabel("Next beat").fill("A pursuit order is issued.");
  await save(page);
  await expect(page.locator(".bigclock")).toContainText("3/5");
  await expect(page.locator(".bigclock")).toContainText("Next: Wanted posters in Vellumis");
  await expect(page.locator(".ladder li")).toHaveCount(3);
  await expect(page.locator(".ladder .doom")).toContainText("Not set");
  await noSeriousA11yIssues(page);

  // A clue needs three routes; ticking one found saves a new version.
  await create(page, "Clue / Revelation", "The Valcerin ledger entry", "Varik Regroups");
  await openEditor(page);
  await page.getByLabel("The truth it reveals").fill("The estate sold a body.");
  await page.getByLabel("Routes to it").fill("The procurement ledger\nThe estate steward");
  await save(page);
  await expect(page.getByText("1 of 3")).toHaveCount(0);
  await expect(page.getByText("2 of 3")).toBeVisible();
  await expect(page.getByText("Fewer than three routes.")).toBeVisible();
  await page.getByRole("checkbox", { name: "The procurement ledger" }).check();
  await expect(page.locator(".routes li").first()).toContainText("found");
  await expect(page.locator(".routes li").first()).not.toContainText("not found");
  await openEditor(page);
  await page.getByLabel("Routes to it").fill("The procurement ledger\nThe estate steward\nA dead man's letter");
  await save(page);
  await expect(page.getByText("3 of 3")).toBeVisible();
  await expect(page.getByText("Fewer than three routes.")).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: "The procurement ledger" })).toBeChecked(); // unchanged route keeps found
  await noSeriousA11yIssues(page);

  // Campaign State and the faction show the clock.
  await page.getByRole("navigation", { name: "Campaign pages" }).getByRole("link", { name: "Campaign State" }).click();
  await expect(page.getByRole("region", { name: "Fronts and clocks" })).toContainText("Varik Regroups");
  await expect(page.getByRole("region", { name: "Fronts and clocks" })).toContainText("3/5");
  await noSeriousA11yIssues(page);
  await page.getByRole("navigation", { name: "Campaign pages" }).getByRole("link", { name: "The Quiet Roads" }).click();
  await expect(page.locator(".front-clock")).toContainText("Varik Regroups");
});

test("dungeon levels with keyed areas, rules with rulings, lore with its truth", async ({ page }) => {
  await signIn(page);
  await page.getByLabel("Name").fill("Levels test");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/wiki$/);

  await create(page, "World / Plane", "Faerûn");
  await create(page, "Region", "The Grey Marches", "Faerûn");
  await create(page, "Dungeon", "The Scarrow", "The Grey Marches");
  await create(page, "Dungeon level", "The village", "The Scarrow");
  await openEditor(page);
  await page.getByLabel("Area", { exact: true }).fill("Ridge road");
  await page.getByLabel("What is here").fill("Wheel ruts, lime smell.");
  await page.getByRole("button", { name: "Add an area" }).click();
  await page.getByRole("group", { name: "Area 2" }).getByLabel("Area", { exact: true }).fill("Village hall");
  await save(page);
  const table = page.getByRole("table");
  await expect(table.getByRole("row")).toHaveCount(3); // header + two areas
  await expect(table).toContainText("Ridge road");
  await noSeriousA11yIssues(page);

  await create(page, "Rule reference", "Turn Undead");
  await expect(page.getByText("Official rule · D&D 2014")).toBeVisible();
  await expect(page.getByText("None. The rule applies as written.")).toBeVisible();
  await create(page, "House ruling", "Turn Undead in the Marches", "Turn Undead");
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Turn Undead" }).click();
  await expect(page.getByRole("region", { name: "Rulings in this campaign" }).getByRole("link", { name: "Turn Undead in the Marches" })).toBeVisible();

  await create(page, "Lore", "The Choir");
  await openEditor(page);
  await page.getByLabel("What people believe").fill("The bells keep the dead quiet.");
  await page.getByLabel("The truth", { exact: true }).fill("A soul-powered engine listens beneath the city.");
  await save(page);
  const truth = page.locator(".grp-block.gm").filter({ hasText: "The truth" });
  await expect(truth).toContainText("GM only");
  await expect(truth).toContainText("A soul-powered engine");
  await noSeriousA11yIssues(page);
});
