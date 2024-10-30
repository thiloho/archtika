import { test, expect } from "@playwright/test";
import { userOwner, userDummy, register, authenticate } from "./shared";

const userDeleted = "test-deleted-m";

test(`Update user website limit`, async ({ page }) => {
  await authenticate(userOwner, page);
  await page.getByRole("link", { name: "Manage" }).click();
  await page
    .locator("tr")
    .filter({ hasNotText: userOwner })
    .getByRole("button", { name: "Manage" })
    .first()
    .click();
  const modalName = page.url().split("#")[1];
  await page.locator(`#${modalName}`).getByLabel("Number of websites allowed:").click();
  await page.locator(`#${modalName}`).getByLabel("Number of websites allowed:").fill("5");
  await page.getByRole("button", { name: "Update website limit" }).click();
  await expect(page.getByText("Successfully updated user website limit")).toBeVisible();
});

test(`Update user website storage limit`, async ({ page }) => {
  await authenticate(userOwner, page);
  await page.getByRole("link", { name: "Manage" }).click();
  await page
    .locator("tr")
    .filter({ hasText: userDummy })
    .getByRole("button", { name: "Manage" })
    .first()
    .click();
  const modalName = page.url().split("#")[1];
  await page.locator(`#${modalName}`).locator("details > summary").first().click();
  await page
    .locator(`#${modalName}`)
    .locator("details")
    .getByLabel("Storage limit in MB:")
    .first()
    .click();
  await page
    .locator(`#${modalName}`)
    .locator("details")
    .getByLabel("Storage limit in MB:")
    .first()
    .fill("555");
  await page
    .locator(`#${modalName}`)
    .locator("details")
    .getByRole("button", { name: "Update storage limit" })
    .click();
  await expect(page.getByText("Successfully updated website storage")).toBeVisible();
});

test(`Delete user`, async ({ page }) => {
  await register(userDeleted, page);
  await authenticate(userOwner, page);
  await page.getByRole("link", { name: "Manage" }).click();
  await page
    .locator("tr")
    .filter({ hasText: userDeleted })
    .getByRole("button", { name: "Manage" })
    .first()
    .click();
  const modalName = page.url().split("#")[1];
  await page.locator(`#${modalName}`).locator('summary:has-text("Delete")').click();
  await page.locator(`#${modalName}`).getByRole("button", { name: "Delete user" }).click();
  await expect(page.getByText("Successfully deleted user")).toBeVisible();
});
