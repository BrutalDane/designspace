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

/** Opens the editor and waits for it, so fields aren't confused with the page's sections of the same name. */
export async function openEditor(page: Page) {
  await page.getByRole("link", { name: "Edit" }).click();
  await expect(page.getByText(/^Editing directly/)).toBeVisible();
}

/** Saves the editor and waits for the page to show again. */
export async function save(page: Page) {
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("link", { name: "Edit" })).toBeVisible();
}
