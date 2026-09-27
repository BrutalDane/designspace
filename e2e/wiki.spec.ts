import { test, expect, type Page } from "@playwright/test";
import { signIn } from "./helpers";

async function newCampaign(page: Page, name: string) {
  await signIn(page);
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/wiki$/);
}

async function addPlace(page: Page, kind: string, name: string, summary = "") {
  await page.getByLabel(new RegExp(`^${kind}\\b`)).check();
  await page.getByLabel("Name").fill(name);
  if (summary) await page.getByLabel("Summary").fill(summary);
  await page.getByRole("button", { name: "Create place" }).click();
  await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
}

test("build a chain of places from world to site, with sensible nesting only", async ({ page }) => {
  await newCampaign(page, "Atlas test");
  await page.getByRole("link", { name: "Add the first place" }).click();
  await expect(page.getByRole("radio")).toHaveCount(3); // World, Region, Settlement at the top
  await addPlace(page, "World", "Toril", "A world of old empires.");
  await expect(page.getByText("A world of old empires.")).toBeVisible();

  await page.getByRole("link", { name: "Add a place inside Toril" }).click();
  await addPlace(page, "Region", "The Vale of Thren");
  await page.getByRole("link", { name: "Add a place inside The Vale of Thren" }).click();
  await addPlace(page, "Settlement", "Larkwater");
  await page.getByRole("link", { name: "Add a place inside Larkwater" }).click();
  await addPlace(page, "District", "Bell Quarter");
  await page.getByRole("link", { name: "Add a place inside Bell Quarter" }).click();
  await expect(page.getByRole("radio")).toHaveCount(1); // only a Site fits in a district
  await addPlace(page, "Site", "The Drowned Bell");

  // A site has nothing inside it, and the breadcrumb shows the whole path.
  await expect(page.getByRole("link", { name: /Add a place inside/ })).toHaveCount(0);
  const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(crumbs.getByRole("link")).toHaveText(["Wiki", "Toril", "The Vale of Thren", "Larkwater", "Bell Quarter"]);

  // The tree shows every level and marks where you are.
  const tree = page.getByRole("navigation", { name: "Places" });
  await expect(tree.getByRole("link")).toHaveCount(5);
  await expect(tree.getByRole("link", { name: /The Drowned Bell/ })).toHaveAttribute("aria-current", "page");
  await tree.getByRole("link", { name: /Larkwater/ }).click();
  await expect(page.getByRole("heading", { name: "Larkwater", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bell Quarter" }).first()).toBeVisible();
});

test("edit a page, read an older version and restore it", async ({ page }) => {
  await newCampaign(page, "History test");
  await page.getByRole("link", { name: "Add the first place" }).click();
  await addPlace(page, "Settlement", "Stonebridge");
  await expect(page.getByText("Nothing written yet.")).toBeVisible();

  await page.getByRole("link", { name: "Edit page" }).click();
  await page.getByLabel("First impression").fill("Mist over a broken bridge.");
  await page.getByRole("button", { name: "Save page" }).click();
  await expect(page.getByRole("heading", { name: "First impression" })).toBeVisible();
  await expect(page.getByText("Mist over a broken bridge.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tensions" })).toHaveCount(0); // empty sections stay hidden

  await page.getByRole("link", { name: "Edit page" }).click();
  await page.getByLabel("Name").fill("Stonebridge Crossing");
  await page.getByLabel("First impression").fill("A new bridge, built too fast.");
  await page.getByRole("button", { name: "Save page" }).click();
  await expect(page.getByRole("heading", { name: "Stonebridge Crossing", level: 1 })).toBeVisible();
  await expect(page.getByText("Version 3")).toBeVisible();

  await page.getByRole("link", { name: "History" }).click();
  const versions = page.getByRole("list", { name: "Versions" }).getByRole("listitem");
  await expect(versions).toHaveCount(3);
  await expect(versions.nth(0)).toContainText("Name, First impression");
  await expect(versions.nth(2)).toContainText("Created");
  await page.getByRole("link", { name: "Version 2" }).click();
  await expect(page.getByText("Mist over a broken bridge.")).toBeVisible();
  await page.getByRole("button", { name: "Restore this version" }).click();

  await expect(page.getByRole("heading", { name: "Stonebridge", level: 1 })).toBeVisible();
  await expect(page.getByText("Mist over a broken bridge.")).toBeVisible();
  await expect(page.getByText("Version 4")).toBeVisible();
});

test("a save from an out-of-date editor never overwrites newer text", async ({ page, context }) => {
  await newCampaign(page, "Conflict test");
  await page.getByRole("link", { name: "Add the first place" }).click();
  await addPlace(page, "Region", "The Fens");
  await page.getByRole("link", { name: "Edit page" }).click();

  const other = await context.newPage();
  await other.goto(page.url());
  await other.getByLabel("Character").fill("Saved first.");
  await other.getByRole("button", { name: "Save page" }).click();
  await expect(other.getByText("Saved first.")).toBeVisible();

  await page.getByLabel("Character").fill("Typed in the older tab.");
  await page.getByRole("button", { name: "Save page" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Nothing was overwritten" })).toBeVisible();
  await expect(page.getByLabel("Character")).toHaveValue("Typed in the older tab.");
  await page.goto(page.url().replace(/\/edit$/, ""));
  await expect(page.getByText("Saved first.")).toBeVisible();
});

test("a place needs a name", async ({ page }) => {
  await newCampaign(page, "Validation test");
  await page.getByRole("link", { name: "Add the first place" }).click();
  await page.getByLabel("Summary").fill("Kept after the error.");
  await page.getByRole("button", { name: "Create place" }).click();
  await expect(page.getByText("Give the page a name.")).toBeVisible();
  await expect(page.getByLabel("Summary")).toHaveValue("Kept after the error.");
});
