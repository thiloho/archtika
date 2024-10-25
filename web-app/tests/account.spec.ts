import { test, expect } from "@playwright/test";
import { userOwner, register, authenticate, password } from "./shared";

const userDeleted = "test-deleted-a";

test(`Logout`, async ({ page }) => {
  await authenticate(userOwner, page);
  await page.getByRole("link", { name: "Account" }).click();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test(`Delete account`, async ({ page }) => {
  await register(userDeleted, page);
  await authenticate(userDeleted, page);
  await page.getByRole("link", { name: "Account" }).click();
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill(password);
  await page
    .locator("#delete-account-modal")
    .getByRole("button", { name: "Delete account" })
    .click();
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});
