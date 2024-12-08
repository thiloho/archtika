import { test, expect } from "@playwright/test";
import {
  userOwner,
  authenticate,
  permissionLevels,
  collabUsers,
  collabTestingWebsite
} from "./shared";

test.describe("Website owner", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(userOwner, page);
    await page
      .locator("li")
      .filter({ hasText: collabTestingWebsite })
      .getByRole("link", { name: collabTestingWebsite })
      .click();
    await page.getByRole("link", { name: "Publish" }).click();
  });

  test(`Publish website`, async ({ page }) => {
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Successfully published website")).toBeVisible();
    await expect(page.getByText("Your website is published at")).toBeVisible();
  });
});

for (const permissionLevel of permissionLevels) {
  test.describe(`Website collaborator (Permission level: ${permissionLevel})`, () => {
    test(`Publish website`, async ({ page }) => {
      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Publish" }).click();

      await page
        .getByRole("button", { name: "Publish" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Publish" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully published website")).toBeVisible();
        await expect(page.getByText("Your website is published at")).toBeVisible();
      }
    });
  });
}
