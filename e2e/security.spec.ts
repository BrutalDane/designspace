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

test("another GM can't read, edit or add to your places, even with their exact addresses", async ({ browser }) => {
  const a = await browser.newPage();
  await signIn(a);
  await a.getByLabel("Name").fill("Secret atlas");
  await a.getByRole("button", { name: "Create campaign" }).click();
  await a.getByRole("link", { name: "Add the first place" }).click();
  await a.getByLabel("Name").fill("Hidden Keep");
  await a.getByRole("button", { name: "Create place" }).click();
  await expect(a.getByRole("heading", { name: "Hidden Keep", level: 1 })).toBeVisible();
  const place = a.url();
  const [campaignA, placeId] = place.match(/\/c\/([0-9a-f-]{36})\/wiki\/([0-9a-f-]{36})$/)!.slice(1);

  const b = await browser.newPage();
  await signIn(b, "other@example.test");
  for (const url of [place, `${place}/edit`, `${place}/history`, `${place}/history/1`, `/c/${campaignA}/wiki/new?parent=${placeId}`]) {
    const res = await b.goto(url);
    expect(res?.status(), url).toBe(404);
    await expect(b.getByText("Hidden Keep")).toHaveCount(0);
  }

  // Even in their own campaign, B can't hang a place under A's place.
  await b.goto("/");
  await b.getByLabel("Name").fill("B's campaign");
  await b.getByRole("button", { name: "Create campaign" }).click();
  await expect(b).toHaveURL(/\/wiki$/);
  const res = await b.goto(b.url().replace(/\/wiki$/, `/wiki/new?parent=${placeId}`));
  expect(res?.status()).toBe(404);
});

test("a place from one campaign can't be opened through another campaign's address", async ({ page }) => {
  await signIn(page);
  await page.getByLabel("Name").fill("First realm");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await page.getByRole("link", { name: "Add the first place" }).click();
  await page.getByLabel("Name").fill("Border Fort");
  await page.getByRole("button", { name: "Create place" }).click();
  await expect(page.getByRole("heading", { name: "Border Fort", level: 1 })).toBeVisible();
  const placeId = page.url().split("/").at(-1);

  await page.goto("/");
  await page.getByLabel("Name").fill("Second realm");
  await page.getByRole("button", { name: "Create campaign" }).click();
  await expect(page).toHaveURL(/\/wiki$/);
  const second = page.url();
  for (const path of [`/${placeId}`, `/new?parent=${placeId}`]) expect((await page.goto(second + path))?.status()).toBe(404);
});
