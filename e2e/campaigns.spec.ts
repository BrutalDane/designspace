import { test, expect } from "@playwright/test";
import { signIn } from "./helpers";

test("create a campaign, open it and switch workspaces", async ({ page }) => {
  await signIn(page);
  await page.getByLabel("Name").fill("The Grey Marches");
  await page.getByLabel("Setting").fill("The Vale of Thren, Faerûn");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/c\/[0-9a-f-]{36}\/wiki$/);
  await expect(page.getByRole("heading", { name: "Wiki", level: 1 })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Workspaces" });
  await expect(nav.getByRole("link", { name: "Wiki" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Worldbuilding" }).click();
  await expect(page.getByRole("heading", { name: "Worldbuilding", level: 1 })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Worldbuilding" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Sessions" }).click();
  await expect(page.getByRole("heading", { name: "Sessions", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Designspace" }).click();
  await expect(page.getByRole("link", { name: /The Grey Marches/ })).toBeVisible();
});

test("a campaign needs a name", async ({ page }) => {
  await signIn(page);
  await page.getByLabel("Name").fill(" ");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page.getByText("Give the campaign a name of at least 2 characters.")).toBeVisible();
});
