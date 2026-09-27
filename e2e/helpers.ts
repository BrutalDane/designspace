import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
export const PASSWORD = "correct-horse-battery";
export async function signIn(page: Page, email = "gm@example.test", password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Campaigns", level: 1 })).toBeVisible();
}

/** WCAG 2.2 AA scan: no serious or critical issues. */
export async function noSeriousA11yIssues(page: Page) {
  await expect(page).toHaveTitle(/Designspace/); // Next.js streams the <title>; scan once it has arrived
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}
