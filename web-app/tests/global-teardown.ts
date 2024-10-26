import { test, expect } from "@playwright/test";
import { password, authenticate, userOwner } from "./shared";

test.beforeEach(async ({ page }) => {
  await authenticate(userOwner, page);
});

test("Delete all regular users", async ({ page }) => {
  await page.getByRole("link", { name: "Manage" }).click();

  await page.waitForSelector("tbody");
  const userRows = page.locator("tbody > tr").filter({ hasNotText: userOwner });

  while ((await userRows.count()) > 0) {
    const currentCount = await userRows.count();

    await userRows.first().getByRole("button", { name: "Manage" }).click();
    const modalName = page.url().split("#")[1];
    await page.locator(`#${modalName}`).locator('summary:has-text("Delete")').click();
    await page.locator(`#${modalName}`).getByRole("button", { name: "Delete user" }).click();

    await expect(userRows).toHaveCount(currentCount - 1);
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
});
