import { test } from "@playwright/test";
import {
  allUsers,
  register,
  authenticate,
  userOwner,
  collabTestingWebsite,
  permissionLevels,
  collabUsers,
  userDummy
} from "./shared";

for (const username of allUsers) {
  test(`Register user "${username}`, async ({ page }) => {
    await register(username, page);
  });
}

test.describe("Collaborator testing website", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(userOwner, page);
  });

  test("Create website", async ({ page }) => {
    await page.getByRole("button", { name: "Create website" }).click();
    await page.getByLabel("Type:").selectOption("Docs");
    await page.locator("#create-website-modal").getByLabel("Title:").click();
    await page.locator("#create-website-modal").getByLabel("Title:").fill(collabTestingWebsite);
    await page
      .locator("#create-website-modal")
      .getByRole("button", { name: "Create website" })
      .click();
  });

  for (const permissionLevel of permissionLevels) {
    test(`Add collaborator "${collabUsers.get(permissionLevel)}"`, async ({ page }) => {
      await page.getByRole("link", { name: collabTestingWebsite }).click();
      await page.getByRole("link", { name: "Collaborators" }).click();
      await page.getByRole("button", { name: "Add collaborator" }).click();
      await page.getByLabel("Username:").click();
      await page.getByLabel("Username:").fill(collabUsers.get(permissionLevel)!);
      await page
        .locator("#add-collaborator-modal")
        .getByLabel("Permission level:")
        .selectOption(permissionLevel.toString());
      await page
        .locator("#add-collaborator-modal")
        .getByRole("button", { name: "Add collaborator" })
        .click();
    });
  }
});

test("Dummy user website", async ({ page }) => {
  await authenticate(userDummy, page);
  await page.getByRole("button", { name: "Create website" }).click();
  await page.getByLabel("Type:").selectOption("Blog");
  await page.locator("#create-website-modal").getByLabel("Title:").click();
  await page.locator("#create-website-modal").getByLabel("Title:").fill("Dummy");
  await page
    .locator("#create-website-modal")
    .getByRole("button", { name: "Create website" })
    .click();
});
