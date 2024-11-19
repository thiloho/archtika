import { test, expect } from "@playwright/test";
import {
  userOwner,
  authenticate,
  permissionLevels,
  collabUsers,
  collabTestingWebsite
} from "./shared";
import { randomBytes } from "node:crypto";

const genWebsiteName = () => randomBytes(12).toString("hex");

test.describe("Website owner", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(userOwner, page);
  });

  test(`Create website`, async ({ page }) => {
    await page.getByRole("button", { name: "Create website" }).click();
    await page.getByLabel("Type:").selectOption("Blog");
    await page.locator("#create-website-modal").getByLabel("Title:").click();
    await page.locator("#create-website-modal").getByLabel("Title:").fill(genWebsiteName());
    await page
      .locator("#create-website-modal")
      .getByRole("button", { name: "Create website" })
      .click();
    const successCreation = page.getByText("Successfully created website");
    const limitExceeded = page.getByText("Limit of 3 websites exceeded");
    await expect(successCreation.or(limitExceeded)).toBeVisible();
    await expect(page.getByRole("link", { name: "All websites" })).toBeVisible();
  });

  test.describe("Modify", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "Create website" }).click();
      await page.getByLabel("Type:").selectOption("Blog");
      await page.locator("#create-website-modal").getByLabel("Title:").click();
      await page.locator("#create-website-modal").getByLabel("Title:").fill(genWebsiteName());
      await page
        .locator("#create-website-modal")
        .getByRole("button", { name: "Create website" })
        .click();
    });

    test(`Update website`, async ({ page }) => {
      await page
        .locator("li")
        .filter({ hasNotText: collabTestingWebsite })
        .getByRole("button", { name: "Update" })
        .first()
        .click();
      const modalName = page.url().split("#")[1];
      await page.locator(`#${modalName}`).getByLabel("Title:").click();
      await page.locator(`#${modalName}`).getByLabel("Title:").fill(genWebsiteName());
      await page.getByRole("button", { name: "Update website" }).click();
      await expect(page.getByText("Successfully updated website")).toBeVisible();
    });
    test(`Delete website`, async ({ page }) => {
      await page
        .locator("li")
        .filter({ hasNotText: collabTestingWebsite })
        .getByRole("button", { name: "Delete" })
        .first()
        .click();
      await page.getByRole("button", { name: "Delete website" }).click();
      await expect(page.getByText("Successfully deleted website")).toBeVisible();
    });
  });
});

for (const permissionLevel of permissionLevels) {
  test.describe(`Website collaborator (Permission level: ${permissionLevel})`, () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(collabUsers.get(permissionLevel)!, page);
    });

    test("Update website", async ({ page }) => {
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("button", { name: "Update" })
        .click();
      await page
        .getByRole("button", { name: "Update website" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update website" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully updated website")).toBeVisible();
      }
    });

    test("Delete website", async ({ page }) => {
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("button", { name: "Delete" })
        .click();
      await page
        .getByRole("button", { name: "Delete website" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Delete website" }).click();

      await expect(page.getByText("Insufficient permissions")).toBeVisible();
    });
  });
}
