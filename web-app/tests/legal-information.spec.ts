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
    await page.getByRole("link", { name: "Legal information" }).click();
  });

  test(`Create/update legal information`, async ({ page }) => {
    await page.getByLabel("Main content:").click();
    await page.getByLabel("Main content:").press("ControlOrMeta+a");
    await page.getByLabel("Main content:").fill("## Content");
    await page.getByRole("button", { name: "Update legal information" }).click();
    await expect(page.getByText("Successfully created/updated legal information")).toBeVisible();
  });

  test(`Delete legal information`, async ({ page }) => {
    await page.getByLabel("Main content:").click();
    await page.getByLabel("Main content:").press("ControlOrMeta+a");
    await page.getByLabel("Main content:").fill("## Arbitrary content");
    await page.getByRole("button", { name: "Update legal information" }).click();

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete legal information" }).click();
    await expect(page.getByText("Successfully deleted legal information")).toBeVisible();
  });
});

for (const permissionLevel of permissionLevels) {
  test.describe(`Website collaborator (Permission level: ${permissionLevel})`, () => {
    test(`Create/update legal information`, async ({ page }) => {
      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Legal information" }).click();

      await page.getByLabel("Main content:").click();
      await page.getByLabel("Main content:").press("ControlOrMeta+a");
      await page.getByLabel("Main content:").fill("## Random content");
      await page
        .getByRole("button", { name: "Update legal information" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update legal information" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(
          page.getByText("Successfully created/updated legal information")
        ).toBeVisible();
      }
    });

    test(`Delete legal information`, async ({ page, browserName }) => {
      test.skip(browserName === "firefox", "Some issues with Firefox in headful mode");

      await authenticate(userOwner, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Legal information" }).click();

      await page.getByLabel("Main content:").click();
      await page.getByLabel("Main content:").press("ControlOrMeta+a");
      await page.getByLabel("Main content:").fill("## Even more content");
      await page.getByRole("button", { name: "Update legal information" }).click();
      await page.waitForResponse(/createUpdateLegalInformation/);
      await page.getByRole("link", { name: "Account" }).click();
      await page.getByRole("button", { name: "Logout" }).click();

      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Legal information" }).click();

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("button", { name: "Delete legal information" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Delete legal information" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully deleted legal information")).toBeVisible();
      }
    });
  });
}
