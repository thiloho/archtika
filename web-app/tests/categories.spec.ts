import { test, expect } from "@playwright/test";
import { randomBytes, randomInt } from "node:crypto";
import {
  userOwner,
  authenticate,
  permissionLevels,
  collabUsers,
  collabTestingWebsite
} from "./shared";

const genCategoryName = () => randomBytes(12).toString("hex");
const genCategoryWeight = (min = 10, max = 10000) => randomInt(min, max).toString();

test.describe("Website owner", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(userOwner, page);
    await page
      .locator("li")
      .filter({ hasText: collabTestingWebsite })
      .getByRole("link", { name: collabTestingWebsite })
      .click();
    await page.getByRole("link", { name: "Categories" }).click();
  });

  test(`Create category`, async ({ page }) => {
    await page.getByRole("button", { name: "Create category" }).click();
    await page.locator("#create-category-modal").getByLabel("Name:").click();
    await page.locator("#create-category-modal").getByLabel("Name:").fill(genCategoryName());
    await page.locator("#create-category-modal").getByLabel("Weight:").click();
    await page.locator("#create-category-modal").getByLabel("Weight:").fill(genCategoryWeight());
    await page
      .locator("#create-category-modal")
      .getByRole("button", { name: "Create category" })
      .click();
    await expect(page.getByText("Successfully created category")).toBeVisible();
    await expect(page.getByRole("link", { name: "All categories" })).toBeVisible();
  });

  test.describe("Modify", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "Create category" }).click();
      await page.locator("#create-category-modal").getByLabel("Name:").click();
      await page.locator("#create-category-modal").getByLabel("Name:").fill(genCategoryName());
      await page.locator("#create-category-modal").getByLabel("Weight:").click();
      await page.locator("#create-category-modal").getByLabel("Weight:").fill(genCategoryWeight());
      await page
        .locator("#create-category-modal")
        .getByRole("button", { name: "Create category" })
        .click();
    });

    test(`Update category`, async ({ page }) => {
      await page.getByRole("button", { name: "Update" }).first().click();
      const modalName = page.url().split("#")[1];
      await page.locator(`#${modalName}`).getByLabel("Name:").click();
      await page.locator(`#${modalName}`).getByLabel("Name:").fill(genCategoryName());
      await page.locator(`#${modalName}`).getByLabel("Weight:").click();
      await page.locator(`#${modalName}`).getByLabel("Weight:").fill(genCategoryWeight());
      await page.getByRole("button", { name: "Update category" }).click();
      await expect(page.getByText("Successfully updated category")).toBeVisible();
    });

    test(`Delete category`, async ({ page }) => {
      await page.getByRole("button", { name: "Delete" }).first().click();
      await page.getByRole("button", { name: "Delete category" }).click();
      await expect(page.getByText("Successfully deleted category")).toBeVisible();
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
      await page.getByRole("link", { name: "Categories" }).click();
    });

    test(`Create category`, async ({ page }) => {
      await page.getByRole("button", { name: "Create category" }).click();
      await page.locator("#create-category-modal").getByLabel("Name:").click();
      await page.locator("#create-category-modal").getByLabel("Name:").fill(genCategoryName());
      await page.locator("#create-category-modal").getByLabel("Weight:").click();
      await page.locator("#create-category-modal").getByLabel("Weight:").fill(genCategoryWeight());
      await page
        .locator("#create-category-modal")
        .getByRole("button", { name: "Create category" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page
        .locator("#create-category-modal")
        .getByRole("button", { name: "Create category" })
        .click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully created category")).toBeVisible();
        await expect(page.getByRole("link", { name: "All categories" })).toBeVisible();
      }
    });

    test(`Update category`, async ({ page }) => {
      await page.getByRole("button", { name: "Update" }).first().click();
      const modalName = page.url().split("#")[1];
      await page.locator(`#${modalName}`).getByLabel("Name:").click();
      await page.locator(`#${modalName}`).getByLabel("Name:").fill(genCategoryName());
      await page.locator(`#${modalName}`).getByLabel("Weight:").click();
      await page.locator(`#${modalName}`).getByLabel("Weight:").fill(genCategoryWeight());
      await page
        .getByRole("button", { name: "Update category" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update category" }).click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully updated category")).toBeVisible();
      }
    });

    test(`Delete category`, async ({ page }) => {
      await page.getByRole("button", { name: "Delete" }).first().click();
      await page
        .getByRole("button", { name: "Delete category" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Delete category" }).click();

      switch (permissionLevel) {
        case 10:
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
          break;
        case 20:
          await expect(
            page
              .getByText("Successfully deleted category")
              .or(page.getByText("Insufficient permissions"))
          ).toBeVisible();
          break;
        case 30:
          await expect(page.getByText("Successfully deleted category")).toBeVisible();
          break;
      }
    });
  });
}
