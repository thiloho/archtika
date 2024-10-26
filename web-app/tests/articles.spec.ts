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
    await page.getByRole("link", { name: "Articles" }).click();
  });

  test(`Create article`, async ({ page }) => {
    await page.getByRole("button", { name: "Create article" }).click();
    await page.locator("#create-article-modal").getByLabel("Title:").click();
    await page.locator("#create-article-modal").getByLabel("Title:").fill("Article");
    await page
      .locator("#create-article-modal")
      .getByRole("button", { name: "Create article" })
      .click();
    await expect(page.getByText("Successfully created article")).toBeVisible();
    await expect(page.getByRole("link", { name: "All articles" })).toBeVisible();
  });

  test.describe("Modify", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "Create article" }).click();
      await page.locator("#create-article-modal").getByLabel("Title:").click();
      await page.locator("#create-article-modal").getByLabel("Title:").fill("Article");
      await page
        .locator("#create-article-modal")
        .getByRole("button", { name: "Create article" })
        .click();
    });

    test(`Update article`, async ({ page }) => {
      await page.getByRole("link", { name: "Edit" }).first().click();
      await page.getByLabel("Weight:").click();
      await page.getByLabel("Weight:").fill("555");
      await page.getByLabel("Title:").click();
      await page.getByLabel("Title:").press("ControlOrMeta+a");
      await page.getByLabel("Title:").fill("Example article");
      await page.getByLabel("Description:").click();
      await page.getByLabel("Description:").fill("Random description");
      await page.getByLabel("Author:").click();
      await page.getByLabel("Author:").fill("John Doe");
      await page.getByLabel("Main content:").click();
      await page.getByLabel("Main content:").fill("## Markdown content comes here");
      await page.getByRole("button", { name: "Update article" }).click();
      await expect(page.getByText("Successfully updated article")).toBeVisible();
    });

    test(`Delete article`, async ({ page }) => {
      await page.getByRole("button", { name: "Delete" }).first().click();
      await page.getByRole("button", { name: "Delete article" }).click();
      await expect(page.getByText("Successfully deleted article")).toBeVisible();
    });
  });
});

for (const permissionLevel of permissionLevels) {
  test.describe(`Website collaborator (Permission level: ${permissionLevel})`, () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Articles" }).click();
    });

    test(`Create article`, async ({ page }) => {
      await page.getByRole("button", { name: "Create article" }).click();
      await page.locator("#create-article-modal").getByLabel("Title:").click();
      await page.locator("#create-article-modal").getByLabel("Title:").fill("Article");
      await page
        .locator("#create-article-modal")
        .getByRole("button", { name: "Create article" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page
        .locator("#create-article-modal")
        .getByRole("button", { name: "Create article" })
        .click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully created article")).toBeVisible();
        await expect(page.getByRole("link", { name: "All articles" })).toBeVisible();
      }
    });

    test(`Update article`, async ({ page }) => {
      await page.getByRole("link", { name: "Edit" }).first().click();
      await page.getByLabel("Weight:").click();
      await page.getByLabel("Weight:").fill("555");
      await page.getByLabel("Title:").click();
      await page.getByLabel("Title:").press("ControlOrMeta+a");
      await page.getByLabel("Title:").fill("Example article");
      await page.getByLabel("Description:").click();
      await page.getByLabel("Description:").fill("Random description");
      await page.getByLabel("Author:").click();
      await page.getByLabel("Author:").fill("John Doe");
      await page.getByLabel("Main content:").click();
      await page.getByLabel("Main content:").fill("## Markdown content comes here");
      await page
        .getByRole("button", { name: "Update article" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update article" }).click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully updated article")).toBeVisible();
      }
    });

    test(`Delete article`, async ({ page }) => {
      await page.getByRole("button", { name: "Delete" }).first().click();
      await page
        .getByRole("button", { name: "Delete article" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Delete article" }).click();

      switch (permissionLevel) {
        case 10:
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
          break;
        case 20:
          await expect(
            page
              .getByText("Successfully deleted article")
              .or(page.getByText("Insufficient permissions"))
          ).toBeVisible();
          break;
        case 30:
          await expect(page.getByText("Successfully deleted article")).toBeVisible();
          break;
      }
    });
  });
}
