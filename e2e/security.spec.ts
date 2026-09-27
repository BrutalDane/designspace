import { test, expect } from "@playwright/test";
import { signIn } from "./helpers";

test("one GM can never open another GM's campaign", async ({ browser }) => {
  const a = await browser.newPage();
  await signIn(a);
  await a.getByLabel("Name").fill("Private campaign");
  await a.getByRole("button", { name: "Create campaign" }).click();
  await expect(a).toHaveURL(/\/wiki$/);
  const url = a.url();

  const b = await browser.newPage();
  await signIn(b, "other@example.test");
  await expect(b.getByText("Private campaign")).toHaveCount(0);
  const res = await b.goto(url);
  expect(res?.status()).toBe(404);
  await expect(b.getByText("Private campaign")).toHaveCount(0);
});

test("probing with made-up ids reveals nothing", async ({ page }) => {
  await signIn(page);
  for (const id of ["not-a-uuid", "00000000-0000-0000-0000-000000000000", "../../etc/passwd"]) {
    const res = await page.goto(`/c/${encodeURIComponent(id)}/wiki`);
    expect(res?.status()).toBe(404);
  }
});
