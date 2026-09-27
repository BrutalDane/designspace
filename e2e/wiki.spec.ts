import { test, expect, type Page } from "@playwright/test";
import { signIn } from "./helpers";

async function newCampaign(page: Page, name: string) {
  await signIn(page);
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/wiki$/);
}

async function addPage(page: Page, kind: string, title: string, lead = "") {
  await page.getByRole("radio", { name: kind }).check();
  await page.getByLabel("Title").fill(title);
  if (lead) await page.getByLabel("Lead").fill(lead);
  await page.getByRole("button", { name: "Create page" }).click();
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
}

async function addInside(page: Page, parent: string, kind: string, title: string) {
  await page.getByRole("link", { name: `Add a place inside ${parent}` }).click();
  await addPage(page, kind, title);
}

/** World → Region → Settlement, which most tests start from. */
async function vellumis(page: Page, campaign: string) {
  await newCampaign(page, campaign);
  await page.getByRole("link", { name: "Add the world" }).click();
  await addPage(page, "World / Plane", "Faerûn");
  await addInside(page, "Faerûn", "Region", "The Grey Marches");
  await addInside(page, "The Grey Marches", "Settlement", "Vellumis");
}

test("build places down the decided hierarchy, with only allowed kinds offered", async ({ page }) => {
  await newCampaign(page, "Hierarchy test");
  await page.getByRole("link", { name: "Add the world" }).click();
  await expect(page.getByRole("radio")).toHaveCount(1); // only a World / Plane sits at the top
  await addPage(page, "World / Plane", "Faerûn", "The world of the Forgotten Realms.");

  await page.getByRole("link", { name: "Add a place inside Faerûn" }).click();
  await expect(page.getByRole("radio")).toHaveCount(1); // a World holds Regions only
  await addPage(page, "Region", "The Grey Marches");
  await page.getByRole("link", { name: "Add a place inside The Grey Marches" }).click();
  await expect(page.locator(".kind-option")).toHaveText(["Region", "Settlement", "Building / Landmark", "Site", "Dungeon"]);
  await addPage(page, "Settlement", "Vellumis");
  await addInside(page, "Vellumis", "District", "The Underbelly");
  await page.getByRole("link", { name: "Add a place inside The Underbelly" }).click();
  await expect(page.locator(".kind-option")).toHaveText(["Building / Landmark", "Site", "Dungeon"]);
  await addPage(page, "Building / Landmark", "Community Kitchen");

  await expect(page.getByRole("link", { name: /Add a place inside/ })).toHaveCount(0);
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link")).toHaveText(["Wiki", "Faerûn", "The Grey Marches", "Vellumis", "The Underbelly"]);

  // The tree opens the path to the current page and can be collapsed and expanded.
  const tree = page.getByRole("navigation", { name: "Campaign pages" });
  await expect(tree.getByRole("link")).toHaveText(["Faerûn", "The Grey Marches", "Vellumis", "The Underbelly", "Community Kitchen"]);
  await expect(tree.getByRole("link", { name: "Community Kitchen" })).toHaveAttribute("aria-current", "page");
  await tree.getByRole("button", { name: "Collapse Faerûn" }).click();
  await expect(tree.getByRole("link")).toHaveText(["Faerûn1"]); // closed branches show their child count
  await tree.getByRole("button", { name: "Expand Faerûn" }).click();
  await expect(tree.getByRole("link", { name: "The Grey Marches" })).toBeVisible();

  // The parent lists what it contains, automatically.
  await crumbs.getByRole("link", { name: "The Underbelly" }).click();
  await expect(page.getByRole("heading", { name: "Points of interest" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Community Kitchen" }).first()).toBeVisible();
});

test("a page shows its layout: lead, read-aloud, groups, GM group, not-written lines and infobox", async ({ page }) => {
  await vellumis(page, "Layout test");
  // Nothing written yet: every group is one quiet line, and nothing looks like an empty box.
  await expect(page.getByText("not written yet: Demographics, Government, Culture and customs, Religion, Factions and guilds")).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveCount(0);

  await page.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Lead").fill("A city of ledgers and bells.");
  await page.getByLabel("Population", { exact: true }).fill("12,000");
  await page.getByLabel("First impression").fill("Fog, bells, and clerks hurrying with ink-stained hands.");
  await page.getByLabel("Religion").fill("The Ledger God is worshipped in counting-houses.");
  await page.getByLabel("Secrets").fill("The guild forges the census.");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("A city of ledgers and bells.")).toBeVisible();
  await expect(page.getByText("Read aloud")).toBeVisible();
  await expect(page.getByText("Fog, bells, and clerks hurrying with ink-stained hands.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Religion" })).toBeVisible();
  await expect(page.getByText("Not written yet: Demographics, Government, Culture and customs, Factions and guilds")).toBeVisible();
  await expect(page.getByText("not written yet: Industry and trade, Infrastructure")).toBeVisible(); // Economy is empty
  await expect(page.getByText("GM only")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Secrets" })).toBeVisible();
  const infobox = page.getByRole("complementary", { name: "Infobox" });
  await expect(infobox).toContainText("Population");
  await expect(infobox).toContainText("12,000");
  await expect(infobox.getByRole("link", { name: "The Grey Marches" })).toBeVisible();
  await expect(infobox).toContainText("Empty: Type, Governance, Economy, Defence");
});

test("edit a page, read an older version and restore it", async ({ page }) => {
  await vellumis(page, "History test");
  await page.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Description").fill("Mist over a broken bridge.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Mist over a broken bridge.")).toBeVisible();

  await page.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Title").fill("Vellumis-on-the-Marsh");
  await page.getByLabel("Description").fill("A new bridge, built too fast.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: "Vellumis-on-the-Marsh", level: 1 })).toBeVisible();
  await expect(page.getByText("Version 3")).toBeVisible();

  await page.getByRole("link", { name: "History" }).click();
  const versions = page.getByRole("list", { name: "Versions" }).getByRole("listitem");
  await expect(versions).toHaveCount(3);
  await expect(versions.nth(0)).toContainText("Title, Description");
  await expect(versions.nth(2)).toContainText("Created");
  await page.getByRole("link", { name: "Version 2" }).click();
  await expect(page.getByText("Mist over a broken bridge.")).toBeVisible();
  await page.getByRole("button", { name: "Restore this version" }).click();

  await expect(page.getByRole("heading", { name: "Vellumis", level: 1 })).toBeVisible();
  await expect(page.getByText("Mist over a broken bridge.")).toBeVisible();
  await expect(page.getByText("Version 4")).toBeVisible();
});

test("move a page by changing its Parent; only allowed parents are offered", async ({ page }) => {
  await vellumis(page, "Move test");
  await page.getByRole("link", { name: "Faerûn" }).first().click();
  await addInside(page, "Faerûn", "Region", "The Vale of Thren");
  const tree = page.getByRole("navigation", { name: "Campaign pages" });
  await tree.getByRole("button", { name: "Expand The Grey Marches" }).click();
  await tree.getByRole("link", { name: "Vellumis" }).click();
  await page.getByRole("link", { name: "Edit" }).click();
  const parent = page.getByLabel("Parent");
  await expect(parent.getByRole("option")).toHaveText(["The Grey Marches · Region", "The Vale of Thren · Region"]); // no World: a Settlement sits under a Region
  await parent.selectOption({ label: "The Vale of Thren · Region" });
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link")).toHaveText(["Wiki", "Faerûn", "The Vale of Thren"]);
});

test("a save from an out-of-date editor never overwrites newer text", async ({ page, context }) => {
  await vellumis(page, "Conflict test");
  await page.getByRole("link", { name: "Edit" }).click();

  const other = await context.newPage();
  await other.goto(page.url());
  await other.getByLabel("Description").fill("Saved first.");
  await other.getByRole("button", { name: "Save" }).click();
  await expect(other.getByText("Saved first.")).toBeVisible();

  await page.getByLabel("Description").fill("Typed in the older tab.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Nothing was overwritten" })).toBeVisible();
  await expect(page.getByLabel("Description")).toHaveValue("Typed in the older tab.");
  await page.goto(page.url().replace(/\/edit$/, ""));
  await expect(page.getByText("Saved first.")).toBeVisible();
});

test("a page needs a title", async ({ page }) => {
  await newCampaign(page, "Validation test");
  await page.getByRole("link", { name: "Add the world" }).click();
  await page.getByLabel("Lead").fill("Kept after the error.");
  await page.getByRole("button", { name: "Create page" }).click();
  await expect(page.getByText("Give the page a title.")).toBeVisible();
  await expect(page.getByLabel("Lead")).toHaveValue("Kept after the error.");
});
