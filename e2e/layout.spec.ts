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
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
});
