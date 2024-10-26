import { test } from "@playwright/test";
import { password, authenticate, userOwner } from "./shared";

test.beforeEach(async ({ page }) => {
  await authenticate(userOwner, page);
});

/* test("Delete all regular users", async ({ page }) => {
  await page.getByRole("link", { name: "Manage" }).click();

  await page.waitForSelector("tbody");
  const userRows = await page.locator("tbody > tr").filter({ hasNotText: userOwner }).all();

  for (const row of userRows) {
    await row.getByRole("button", { name: "Manage" }).click();
    const modalName = page.url().split("#")[1];
    await page.locator(`#${modalName}`).locator('summary:has-text("Delete")').click();
    await page.locator(`#${modalName}`).getByRole("button", { name: "Delete user" }).click();
  }
});

test("Delete admin account", async ({ page }) => {
  await page.getByRole("link", { name: "Account" }).click();
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill(password);
  await page
    .locator("#delete-account-modal")
    .getByRole("button", { name: "Delete account" })
    .click();
}); */
