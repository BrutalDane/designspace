import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { signIn } from "./helpers";

async function noSeriousA11yIssues(page: import("@playwright/test").Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

test("sign-in, campaign list and a workspace pass the accessibility scan and fit the screen", async ({ page }) => {
  await page.goto("/login");
  await noSeriousA11yIssues(page);
  await signIn(page);
  await noSeriousA11yIssues(page);
  await page.getByLabel("Name").fill("Layout check");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/wiki$/);
  await noSeriousA11yIssues(page);
  await fitsTheScreen(page);
});

async function fitsTheScreen(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow, page.url()).toBe(false);
}

test("wiki pages pass the accessibility scan and fit the screen", async ({ page }) => {
  await signIn(page);
  await page.getByLabel("Name").fill("Wiki layout check");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await page.getByRole("link", { name: "Add the first place" }).click();
  await noSeriousA11yIssues(page);
  await page.getByLabel("Name").fill("A settlement with a rather long name that has to wrap on phones");
  await page.getByLabel(/^Settlement\b/).check();
  await page.getByRole("button", { name: "Create place" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("rather long name");
  await page.getByRole("link", { name: "Edit page" }).click();
  await noSeriousA11yIssues(page);
  await fitsTheScreen(page);
  await page.getByLabel("First impression").fill("Bells in the fog.");
  await page.getByRole("button", { name: "Save page" }).click();
  await expect(page.getByText("Bells in the fog.")).toBeVisible();
  await noSeriousA11yIssues(page);
  await fitsTheScreen(page);
  await page.getByRole("link", { name: "History" }).click();
  await noSeriousA11yIssues(page);
  await page.getByRole("link", { name: "Version 1" }).click();
  await noSeriousA11yIssues(page);
  await fitsTheScreen(page);
  await page.getByRole("link", { name: "Wiki", exact: true }).first().click();
  await expect(page.getByRole("navigation", { name: "Places" })).toBeVisible(); // the tree is reachable on phones too
  await noSeriousA11yIssues(page);
  await fitsTheScreen(page);
});
