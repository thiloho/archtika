import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { platform } from "node:os";

const username = randomBytes(8).toString("hex");
const collabUsername = randomBytes(8).toString("hex");
const collabUsername2 = randomBytes(8).toString("hex");
const collabUsername3 = randomBytes(8).toString("hex");
const collabUsername4 = randomBytes(8).toString("hex");
const customPrefix = Buffer.from(randomBytes(16).map((byte) => (byte % 26) + 97)).toString();
const customPrefix2 = Buffer.from(randomBytes(16).map((byte) => (byte % 26) + 97)).toString();
const password = "T3stuser??!!";

const permissionLevels = [10, 20, 30];

test.describe.serial("Collaborator tests", () => {
  test("Setup", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(username);
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername);
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername2);
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername3);
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername4);
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.goto("/login");
    await page.getByLabel("Username:").fill(username);
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByRole("button", { name: "Create website" }).click();
    await page.getByLabel("Title:").click();
    await page.getByLabel("Title:").fill("Blog");
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("link", { name: "Blog" }).click();
    await page.getByRole("link", { name: "Publish" }).click();
    await page.getByRole("button", { name: "Publish" }).click();
    await page.getByLabel("Prefix:").click();
    await page.getByLabel("Prefix:").fill(customPrefix);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.goto("/");
    await page.getByRole("button", { name: "Create website" }).click();
    await page.getByLabel("Type: BlogDocs").selectOption("Docs");
    await page.getByLabel("Title:").click();
    await page.getByLabel("Title:").fill("Documentation");
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByRole("link", { name: "Blog" }).click();
    await page.getByRole("link", { name: "Articles" }).click();
    await page.getByRole("button", { name: "Create article" }).click();
    await page.getByLabel("Title:").click();
    await page.getByLabel("Title:").fill("Article-10");
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByRole("link", { name: "Collaborators" }).click();
    await page.getByRole("button", { name: "Add collaborator" }).click();
    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername);
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("button", { name: "Add collaborator" }).click();
    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername2);
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("button", { name: "Add collaborator" }).click();
    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername3);
    await page.getByRole("combobox").selectOption("30");
    await page.getByRole("button", { name: "Submit" }).click();

    await page.goto("/");
    await page.getByRole("link", { name: "Documentation" }).click();
    await page.getByRole("link", { name: "Categories" }).click();
    await page.getByRole("button", { name: "Create category" }).click();
    await page.getByLabel("Name:").nth(0).click();
    await page.getByLabel("Name:").nth(0).fill("Category-10");
    await page.getByLabel("Weight:").click();
    await page.getByLabel("Weight:").fill("10");
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByRole("link", { name: "Collaborators" }).click();
    await page.getByRole("button", { name: "Add collaborator" }).click();
    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(collabUsername);
    await page.getByRole("button", { name: "Submit" }).click();

    await page.getByRole("link", { name: "Legal information" }).click();
    await page.getByLabel("Main content:").click();
    await page.getByLabel("Main content:").fill("## Content");
    await page.getByRole("button", { name: "Submit" }).click();
  });

  for (const permissionLevel of permissionLevels) {
    test(`Set collaborator permission level to ${permissionLevel}`, async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Username:").fill(username);
      await page.getByLabel("Password:").fill(password);
      await page.getByRole("button", { name: "Submit" }).click();
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByRole("link", { name: "Collaborators" }).click();
      await page
        .locator("li")
        .filter({ hasText: collabUsername })
        .getByRole("button")
        .first()
        .click();
      await page.getByRole("combobox").selectOption(permissionLevel.toString());
      await page.getByRole("button", { name: "Update collaborator" }).click();

      await page.goto("/");
      await page.getByRole("link", { name: "Documentation" }).click();
      await page.getByRole("link", { name: "Collaborators" }).click();
      await page
        .locator("li")
        .filter({ hasText: collabUsername })
        .getByRole("button")
        .first()
        .click();
      await page.getByRole("combobox").selectOption(permissionLevel.toString());
      await page.getByRole("button", { name: "Update collaborator" }).click();
    });

    test.describe.serial(`Permission level: ${permissionLevel}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("Username:").fill(collabUsername);
        await page.getByLabel("Password:").fill(password);
        await page.getByRole("button", { name: "Submit" }).click();
      });

      test("Update website", async ({ page }) => {
        await page.locator("li").filter({ hasText: "Blog" }).getByRole("button").first().click();
        const modalName = page.url().split("#")[1];
        await page
          .locator(`div[id="${modalName}"] button[type="submit"]`)
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Submit" }).click();

        if ([10, 20].includes(permissionLevel)) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated website")).toBeVisible();
        }
      });
      test("Delete website", async ({ page }) => {
        await page.locator("li").filter({ hasText: "Blog" }).getByRole("button").nth(1).click();
        const modalName = page.url().split("#")[1];
        await page
          .locator(`div[id="${modalName}"] button[type="submit"]`)
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Delete website" }).click();
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      });
      test("Update Global", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page
          .locator('#global button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.locator("#global").getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated global")).toBeVisible();
        }
      });
      test("Update Header", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page
          .locator('#header button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.locator("#header").getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated header")).toBeVisible();
        }
      });
      test("Update Home", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByLabel("Description:").click();
        await page.getByLabel("Description:").fill("Description");
        await page
          .locator('#home button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.locator("#home").getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated home")).toBeVisible();
        }
      });
      test("Update Footer", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page
          .locator('#footer button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.locator("#footer").getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated footer")).toBeVisible();
        }
      });
      test("Create article", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Articles" }).click();
        await page.getByRole("button", { name: "Create article" }).click();
        await page.getByLabel("Title:").click();
        await page.getByLabel("Title:").fill(`Article-${permissionLevel}`);
        await page
          .locator('form[action="?/createArticle"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully created article")).toBeVisible();
        }
      });
      test("Update article", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Articles" }).click();
        await page
          .locator("li")
          .filter({ hasText: `Article-${permissionLevel}` })
          .getByRole("link")
          .click();
        await page.getByLabel("Description:").click();
        await page.getByLabel("Description:").fill("Description");
        await page.getByLabel("Author:").click();
        await page.getByLabel("Author:").fill("Author");
        await page.getByLabel("Main content:").click();
        await page.getByLabel("Main content:").fill("## Main content");
        await page
          .locator('form button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated article")).toBeVisible();
        }
      });
      test("Delete article", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Articles" }).click();
        await page
          .locator("li")
          .filter({ hasText: `Article-${permissionLevel}` })
          .getByRole("button")
          .click();
        const modalName = page.url().split("#")[1];
        await page
          .locator(`div[id="${modalName}"] button[type="submit"]`)
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Delete article" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        }
        if ([20, 30].includes(permissionLevel)) {
          await expect(page.getByText("Successfully deleted article")).toBeVisible();

          await page.locator("li").filter({ hasText: `Article-10` }).getByRole("button").click();
          const modalName = page.url().split("#")[1];
          await page
            .locator(`div[id="${modalName}"] button[type="submit"]`)
            .evaluate((node) => node.removeAttribute("disabled"));
          await page.getByRole("button", { name: "Delete article" }).click();

          if (permissionLevel === 20) {
            await expect(page.getByText("Insufficient permissions")).toBeVisible();
          } else {
            await expect(page.getByText("Successfully deleted article")).toBeVisible();
          }
        }
      });
      test("Add collaborator", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Collaborators" }).click();
        await page.getByRole("button", { name: "Add collaborator" }).click();
        await page.getByLabel("Username:").click();
        await page.getByLabel("Username:").fill(collabUsername4);
        await page
          .locator('form[action="?/addCollaborator"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Submit" }).click();

        if ([10, 20].includes(permissionLevel)) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully added")).toBeVisible();
        }
      });
      test("Update collaborator", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Collaborators" }).click();
        await page
          .locator("li")
          .filter({ hasText: collabUsername2 })
          .getByRole("button")
          .first()
          .click();
        await page.getByRole("combobox").selectOption("20");
        const modalName = page.url().split("#")[1];
        await page
          .locator(`div[id="${modalName}"] button[type="submit"]`)
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Update collaborator" }).click();

        if ([10, 20].includes(permissionLevel)) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated")).toBeVisible();

          await page
            .locator("li")
            .filter({ hasText: collabUsername2 })
            .getByRole("button")
            .first()
            .click();
          await page.getByRole("combobox").selectOption("30");
          await page.getByRole("button", { name: "Update collaborator" }).click();
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        }
      });
      test("Remove collaborator", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Collaborators" }).click();
        await page
          .locator("li")
          .filter({ hasText: collabUsername2 })
          .getByRole("button")
          .nth(1)
          .click();
        const modalName = page.url().split("#")[1];
        await page
          .locator(`div[id="${modalName}"] button[type="submit"]`)
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Remove collaborator" }).click();

        if ([10, 20].includes(permissionLevel)) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully removed")).toBeVisible();

          await page
            .locator("li")
            .filter({ hasText: collabUsername3 })
            .getByRole("button")
            .nth(1)
            .click();
          await page.getByRole("button", { name: "Remove collaborator" }).click();
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        }
      });
      test("Create/Update legal information", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Legal information" }).click();
        await page.getByLabel("Main content:").click();
        await page.getByLabel("Main content:").fill("## Content");
        await page
          .locator('form[action="?/createUpdateLegalInformation"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 30) {
          await expect(page.getByText("Successfully created/updated legal")).toBeVisible();
        } else {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        }
      });
      test("Delete legal information", async ({ page }) => {
        await page
          .getByRole("link", {
            name: [10, 20].includes(permissionLevel) ? "Documentation" : "Blog"
          })
          .click();
        await page.getByRole("link", { name: "Legal information" }).click();
        await page.getByRole("button", { name: "Delete" }).click();
        await page
          .locator('form[action="?/deleteLegalInformation"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Delete legal information" }).click();

        if (permissionLevel === 30) {
          await expect(page.getByText("Successfully deleted legal")).toBeVisible();
        } else {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        }
      });
      test("Create category", async ({ page }) => {
        await page.getByRole("link", { name: "Documentation" }).click();
        await page.getByRole("link", { name: "Categories" }).click();
        await page.getByRole("button", { name: "Create category" }).click();
        await page.getByLabel("Name:").nth(0).click();
        await page.getByLabel("Name:").nth(0).fill(`Category-${permissionLevel}`);
        await page.getByRole("spinbutton", { name: "Weight:" }).click();
        await page.getByRole("spinbutton", { name: "Weight:" }).fill(permissionLevel.toString());
        await page
          .locator('form[action="?/createCategory"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Submit" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully created category")).toBeVisible();
        }
      });
      test("Update category", async ({ page }) => {
        await page.getByRole("link", { name: "Documentation" }).click();
        await page.getByRole("link", { name: "Categories" }).click();
        await page
          .locator("li")
          .filter({ hasText: `Category-${permissionLevel}` })
          .getByRole("button")
          .first()
          .click();
        await page.getByRole("spinbutton", { name: "Weight:" }).click();
        await page
          .getByRole("spinbutton", { name: "Weight:" })
          .fill((permissionLevel * 2).toString());
        const modalName = page.url().split("#")[1];
        await page
          .locator(`div[id="${modalName}"] button[type="submit"]`)
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Update category" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully updated category")).toBeVisible();
        }
      });
      test("Delete category", async ({ page }) => {
        await page.getByRole("link", { name: "Documentation" }).click();
        await page.getByRole("link", { name: "Categories" }).click();
        await page
          .locator("li")
          .filter({ hasText: `Category-${permissionLevel}` })
          .getByRole("button")
          .nth(1)
          .click();
        const modalName = page.url().split("#")[1];
        await page
          .locator(`div[id="${modalName}"] button[type="submit"]`)
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Delete category" }).click();

        if (permissionLevel === 10) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        }
        if ([20, 30].includes(permissionLevel)) {
          await expect(page.getByText("Successfully deleted category")).toBeVisible();

          await page
            .locator("li")
            .filter({ hasText: "Category-10" })
            .getByRole("button")
            .nth(1)
            .click();
          const modalName = page.url().split("#")[1];
          await page
            .locator(`div[id="${modalName}"] button[type="submit"]`)
            .evaluate((node) => node.removeAttribute("disabled"));
          await page.getByRole("button", { name: "Delete category" }).click();

          if (permissionLevel === 20) {
            await expect(page.getByText("Insufficient permissions")).toBeVisible();
          } else {
            await expect(page.getByText("Successfully deleted category")).toBeVisible();
          }
        }
      });
      test("Publish website", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Publish" }).click();
        await page
          .locator('form[action="?/publishWebsite"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Publish" }).click();

        if ([10, 20].includes(permissionLevel)) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully published website")).toBeVisible();
        }
      });
      test("Set custom domain prefix", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Publish" }).click();

        const isMac = platform() === "darwin";
        const modifier = isMac ? "Meta" : "Control";
        await page.getByLabel("Prefix:").click();
        await page.keyboard.press(`${modifier}+A`);
        await page.keyboard.press(`Backspace`);
        await page.getByLabel("Prefix:").fill(customPrefix2);
        await page
          .locator('form[action="?/createUpdateCustomDomainPrefix"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Submit" }).click();

        if ([10, 20].includes(permissionLevel)) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully created/updated")).toBeVisible();
        }
      });
      test("Remove custom domain prefix", async ({ page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Publish" }).click();
        await page.getByRole("button", { name: "Delete" }).click();
        await page
          .locator('form[action="?/deleteCustomDomainPrefix"] button[type="submit"]')
          .evaluate((node) => node.removeAttribute("disabled"));
        await page.getByRole("button", { name: "Delete domain prefix" }).click();

        if ([10, 20].includes(permissionLevel)) {
          await expect(page.getByText("Insufficient permissions")).toBeVisible();
        } else {
          await expect(page.getByText("Successfully deleted domain")).toBeVisible();
        }
      });
    });
  }

  test("Delete all accounts", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Username:").fill(username);
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await page.getByRole("button", { name: "Delete account" }).click();
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page
      .locator("#delete-account-modal")
      .getByRole("button", { name: "Delete account" })
      .click();

    await page.getByLabel("Username:").fill(collabUsername);
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await page.getByRole("button", { name: "Delete account" }).click();
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page
      .locator("#delete-account-modal")
      .getByRole("button", { name: "Delete account" })
      .click();

    await page.getByLabel("Username:").fill(collabUsername2);
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await page.getByRole("button", { name: "Delete account" }).click();
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page
      .locator("#delete-account-modal")
      .getByRole("button", { name: "Delete account" })
      .click();

    await page.getByLabel("Username:").fill(collabUsername3);
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await page.getByRole("button", { name: "Delete account" }).click();
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page
      .locator("#delete-account-modal")
      .getByRole("button", { name: "Delete account" })
      .click();

    await page.getByLabel("Username:").fill(collabUsername4);
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("link", { name: "Account" }).click();
    await page.getByRole("button", { name: "Delete account" }).click();
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page
      .locator("#delete-account-modal")
      .getByRole("button", { name: "Delete account" })
      .click();
  });
});
