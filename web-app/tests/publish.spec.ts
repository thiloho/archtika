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

  test(`Set custom domain prefix`, async ({ page }) => {
    await page.getByLabel("Prefix:").click();
    await page.getByLabel("Prefix:").press("ControlOrMeta+a");
    await page.getByLabel("Prefix:").fill("example-prefix");
    await page.getByRole("button", { name: "Update domain prefix" }).click();
    await expect(page.getByText("Successfully created/updated domain prefix")).toBeVisible();
  });

  test(`Delete custom domain prefix`, async ({ page }) => {
    await page.getByLabel("Prefix:").click();
    await page.getByLabel("Prefix:").press("ControlOrMeta+a");
    await page.getByLabel("Prefix:").fill("example-prefix");
    await page.getByRole("button", { name: "Update domain prefix" }).click();

    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete domain prefix" }).click();
    await expect(page.getByText("Successfully deleted domain prefix")).toBeVisible();
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

    test(`Set custom domain prefix`, async ({ page }) => {
      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Publish" }).click();

      await page.getByLabel("Prefix:").click();
      await page.getByLabel("Prefix:").press("ControlOrMeta+a");
      await page.getByLabel("Prefix:").fill("new-prefix");
      await page
        .getByRole("button", { name: "Update domain prefix" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update domain prefix" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully created/updated domain prefix")).toBeVisible();
      }
    });

    test(`Delete custom domain prefix`, async ({ page, browserName }) => {
      test.skip(browserName === "firefox", "Some issues with Firefox in headful mode");

      await authenticate(userOwner, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Publish" }).click();

      await page.getByLabel("Prefix:").click();
      await page.getByLabel("Prefix:").press("ControlOrMeta+a");
      await page.getByLabel("Prefix:").fill("new-prefix");
      await page.getByRole("button", { name: "Update domain prefix" }).click();
      await page.waitForResponse(/createUpdateCustomDomainPrefix/);
      await page.getByRole("link", { name: "Account" }).click();
      await page.getByRole("button", { name: "Logout" }).click();

      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Publish" }).click();

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("button", { name: "Delete domain prefix" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Delete domain prefix" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully deleted domain prefix")).toBeVisible();
      }
    });
  });
}
