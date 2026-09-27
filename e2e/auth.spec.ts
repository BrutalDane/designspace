import { test, expect } from "@playwright/test";
import { signIn } from "./helpers";

test("anonymous visitors are sent to sign in, everywhere", async ({ page }) => {
  for (const path of ["/", "/c/00000000-0000-0000-0000-000000000000/wiki"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("there is no way to create an account from the website", async ({ page, request }) => {
  await page.goto("/login");
  await expect(page.getByText(/sign up|register|create account/i)).toHaveCount(0);
  const res = await request.post("/api/auth/sign-up/email", { data: { email: "x@example.test", password: "correct-horse-battery", name: "X" } });
  expect(res.ok()).toBe(false);
});

test("a wrong password gives one neutral message", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("gm@example.test");
  await page.getByLabel("Password").fill("not-the-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "match" })).toHaveText("That email and password don't match a GM account.");
});

test("the GM can sign in and out", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
