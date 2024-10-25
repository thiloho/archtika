import { test, expect } from "@playwright/test";
import { randomBytes, randomInt, type UUID } from "node:crypto";
import {
  userOwner,
  register,
  authenticate,
  permissionLevels,
  collabUsers,
  collabTestingWebsite,
  userCollab10,
  userCollab20,
  userCollab30
} from "./shared";

const genUsername = () => randomBytes(8).toString("hex") as UUID;
const pickPermissionLevel = () => permissionLevels[randomInt(permissionLevels.length)].toString();

test.describe("Website owner", () => {
  test(`Add collaborator`, async ({ page }) => {
    const addUsername = genUsername();

    await register(addUsername, page);
    await authenticate(userOwner, page);
    await page
      .locator("li")
      .filter({ hasText: collabTestingWebsite })
      .getByRole("link", { name: collabTestingWebsite })
      .click();
    await page.getByRole("link", { name: "Collaborators" }).click();

    await page.getByRole("button", { name: "Add collaborator" }).click();
    await page.locator("#add-collaborator-modal").getByLabel("Username:").click();
    await page.locator("#add-collaborator-modal").getByLabel("Username:").fill(addUsername);
    await page
      .locator("#add-collaborator-modal")
      .getByLabel("Permission level:")
      .selectOption(pickPermissionLevel());
    await page
      .locator("#add-collaborator-modal")
      .getByRole("button", { name: "Add collaborator" })
      .click();
    await expect(page.getByText("Successfully added collaborator")).toBeVisible();
    await expect(page.getByRole("link", { name: "All collaborators" })).toBeVisible();
  });

  test.describe("Modify", () => {
    let modifyUsername: UUID;

    test.beforeEach(async ({ page }) => {
      modifyUsername = genUsername();
      await register(modifyUsername, page);
      await authenticate(userOwner, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Collaborators" }).click();
      await page.getByRole("button", { name: "Add collaborator" }).click();
      await page.locator("#add-collaborator-modal").getByLabel("Username:").click();
      await page.locator("#add-collaborator-modal").getByLabel("Username:").fill(modifyUsername);
      await page
        .locator("#add-collaborator-modal")
        .getByLabel("Permission level:")
        .selectOption(pickPermissionLevel());
      await page
        .locator("#add-collaborator-modal")
        .getByRole("button", { name: "Add collaborator" })
        .click();
    });

    test(`Update collaborator`, async ({ page }) => {
      await page
        .locator("li")
        .filter({ hasText: modifyUsername })
        .getByRole("button", { name: "Update" })
        .first()
        .click();
      const modalName = page.url().split("#")[1];
      await page
        .locator(`#${modalName}`)
        .getByLabel("Permission level:")
        .selectOption(pickPermissionLevel());
      await page.getByRole("button", { name: "Update collaborator" }).click();
      await expect(page.getByText("Successfully updated collaborator")).toBeVisible();
    });

    test(`Remove collaborator`, async ({ page }) => {
      await page
        .locator("li")
        .filter({ hasText: modifyUsername })
        .getByRole("button", { name: "Remove" })
        .first()
        .click();
      await page.getByRole("button", { name: "Remove collaborator" }).click();
      await expect(page.getByText("Successfully removed collaborator")).toBeVisible();
    });
  });
});

for (const permissionLevel of permissionLevels) {
  test.describe(`Website collaborator (Permission level: ${permissionLevel})`, () => {
    test(`Add collaborator`, async ({ page }) => {
      const addUsername = genUsername();

      await register(addUsername, page);
      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Collaborators" }).click();

      await page.getByRole("button", { name: "Add collaborator" }).click();
      await page.locator("#add-collaborator-modal").getByLabel("Username:").click();
      await page.locator("#add-collaborator-modal").getByLabel("Username:").fill(addUsername);
      await page
        .locator("#add-collaborator-modal")
        .getByLabel("Permission level:")
        .selectOption(pickPermissionLevel());
      await page
        .locator("#add-collaborator-modal")
        .getByRole("button", { name: "Add collaborator" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page
        .locator("#add-collaborator-modal")
        .getByRole("button", { name: "Add collaborator" })
        .click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(
          page
            .getByText("Successfully added collaborator")
            .or(page.getByText("Insufficient permissions"))
        ).toBeVisible();
      }
    });

    test(`Update collaborator`, async ({ page }) => {
      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Collaborators" }).click();

      await page
        .locator("li")
        .filter({ hasNotText: new RegExp(`${userCollab10}|${userCollab20}|${userCollab30}`) })
        .getByRole("button", { name: "Update" })
        .first()
        .click();
      const modalName = page.url().split("#")[1];
      await page
        .locator(`#${modalName}`)
        .getByLabel("Permission level:")
        .selectOption(pickPermissionLevel());
      await page
        .getByRole("button", { name: "Update collaborator" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update collaborator" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(
          page
            .getByText("Successfully updated collaborator")
            .or(page.getByText("Insufficient permissions"))
        ).toBeVisible();
      }
    });

    test(`Remove collaborator`, async ({ page }) => {
      await authenticate(collabUsers.get(permissionLevel)!, page);
      await page
        .locator("li")
        .filter({ hasText: collabTestingWebsite })
        .getByRole("link", { name: collabTestingWebsite })
        .click();
      await page.getByRole("link", { name: "Collaborators" }).click();

      await page
        .locator("li")
        .filter({ hasNotText: new RegExp(`${userCollab10}|${userCollab20}|${userCollab30}`) })
        .getByRole("button", { name: "Remove" })
        .first()
        .click();
      await page
        .getByRole("button", { name: "Remove collaborator" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Remove collaborator" }).click();

      if ([10, 20].includes(permissionLevel)) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(
          page
            .getByText("Successfully removed collaborator")
            .or(page.getByText("Insufficient permissions"))
        ).toBeVisible();
      }
    });
  });
}
