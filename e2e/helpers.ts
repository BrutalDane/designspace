import { expect, type Page } from "@playwright/test";
export const PASSWORD = "correct-horse-battery";
export async function signIn(page: Page, email = "gm@example.test", password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Campaigns", level: 1 })).toBeVisible();
}
