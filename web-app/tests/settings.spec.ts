import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  userOwner,
  authenticate,
  permissionLevels,
  collabUsers,
  collabTestingWebsite
} from "./shared";

const genRandomHex = () => `#${randomBytes(3).toString("hex")}`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test.describe("Website owner", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(userOwner, page);
    await page
      .locator("li")
      .filter({ hasText: collabTestingWebsite })
      .getByRole("link", { name: collabTestingWebsite })
      .click();
  });

  test("Update global", async ({ page, browserName }) => {
    test.skip(browserName === "firefox", "Some issues with Firefox in headless mode");

    await page.getByLabel("Background color dark theme:").click();
    await page.getByLabel("Background color dark theme:").fill(genRandomHex());
    await page.getByLabel("Background color light theme:").click();
    await page.getByLabel("Background color light theme:").fill(genRandomHex());
    await page.getByLabel("Accent color dark theme:").click();
    await page.getByLabel("Accent color dark theme:").fill(genRandomHex());
    await page.getByLabel("Accent color light theme:").click();
    await page.getByLabel("Accent color light theme:").fill(genRandomHex());
    await page.getByLabel("Favicon:").click();
    await page
      .getByLabel("Favicon:")
      .setInputFiles(join(__dirname, "sample-files", "archtika-logo-512x512.png"));
    await page.getByRole("button", { name: "Update global" }).click();
    await expect(page.getByText("Successfully updated global")).toBeVisible();
  });

  test("Update header", async ({ page, browserName }) => {
    test.skip(browserName === "firefox", "Some issues with Firefox in headless mode");

    await page.getByLabel("Logo type:").selectOption("image");
    await page.getByLabel("Logo text:").click();
    await page.getByLabel("Logo text:").press("ControlOrMeta+a");
    await page.getByLabel("Logo text:").fill("Logo text");
    await page.getByLabel("Logo image:").click();
    await page
      .getByLabel("Logo image")
      .setInputFiles(join(__dirname, "sample-files", "archtika-logo-512x512.png"));
    await page.getByRole("button", { name: "Update header" }).click();
    await expect(page.getByText("Successfully updated header")).toBeVisible();
  });

  test("Update home", async ({ page }) => {
    await page.getByLabel("Description:").click();
    await page.getByLabel("Description:").fill("Description comes here");
    await page.getByLabel("Main content:").click();
    await page.getByLabel("Main content:").press("ControlOrMeta+a");
    await page.getByLabel("Main content:").fill("## Updated main content");
    await page.getByRole("button", { name: "Update home" }).click();
    await expect(page.getByText("Successfully updated home")).toBeVisible();
  });

  test("Update footer", async ({ page }) => {
    await page.getByLabel("Additional text:").click();
    await page.getByLabel("Additional text:").press("ControlOrMeta+a");
    await page.getByLabel("Additional text:").fill("Updated footer content");
    await page.getByRole("button", { name: "Update footer" }).click();
    await expect(page.getByText("Successfully updated footer")).toBeVisible();
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
    });

    test("Update global", async ({ page, browserName }) => {
      test.skip(browserName === "firefox", "Some issues with Firefox in headless mode");

      await page.getByLabel("Background color dark theme:").click();
      await page.getByLabel("Background color dark theme:").fill(genRandomHex());
      await page.getByLabel("Background color light theme:").click();
      await page.getByLabel("Background color light theme:").fill(genRandomHex());
      await page.getByLabel("Accent color dark theme:").click();
      await page.getByLabel("Accent color dark theme:").fill(genRandomHex());
      await page.getByLabel("Accent color light theme:").click();
      await page.getByLabel("Accent color light theme:").fill(genRandomHex());
      await page.getByLabel("Favicon:").click();
      await page
        .getByLabel("Favicon:")
        .setInputFiles(join(__dirname, "sample-files", "archtika-logo-512x512.png"));
      await page
        .getByRole("button", { name: "Update global" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update global" }).click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully updated global")).toBeVisible();
      }
    });

    test("Update header", async ({ page, browserName }) => {
      test.skip(browserName === "firefox", "Some issues with Firefox in headless mode");

      await page.getByLabel("Logo type:").selectOption("image");
      await page.getByLabel("Logo text:").click();
      await page.getByLabel("Logo text:").press("ControlOrMeta+a");
      await page.getByLabel("Logo text:").fill("Logo text");
      await page.getByLabel("Logo image:").click();
      await page
        .getByLabel("Logo image")
        .setInputFiles(join(__dirname, "sample-files", "archtika-logo-512x512.png"));
      await page
        .getByRole("button", { name: "Update header" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update header" }).click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully updated header")).toBeVisible();
      }
    });

    test("Update home", async ({ page }) => {
      await page.getByLabel("Description:").click();
      await page.getByLabel("Description:").fill("Description comes here");
      await page.getByLabel("Main content:").click();
      await page.getByLabel("Main content:").press("ControlOrMeta+a");
      await page.getByLabel("Main content:").fill("## Updated main content");
      await page
        .getByRole("button", { name: "Update home" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update home" }).click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully updated home")).toBeVisible();
      }
    });

    test("Update footer", async ({ page }) => {
      await page.getByLabel("Additional text:").click();
      await page.getByLabel("Additional text:").press("ControlOrMeta+a");
      await page.getByLabel("Additional text:").fill("Updated footer content");
      await page
        .getByRole("button", { name: "Update footer" })
        .evaluate((node) => node.removeAttribute("disabled"));
      await page.getByRole("button", { name: "Update footer" }).click();

      if (permissionLevel === 10) {
        await expect(page.getByText("Insufficient permissions")).toBeVisible();
      } else {
        await expect(page.getByText("Successfully updated footer")).toBeVisible();
      }
    });
  });
}
