import { test as base, expect, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const username = randomBytes(8).toString("hex");
const collabUsername = randomBytes(8).toString("hex");
const password = "T3stuser??!!";

const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByLabel("Username:").fill(username);
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await use(page);
  }
});

test("Register", async ({ page }) => {
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
});

test("Create websites", async ({ authenticatedPage: page }) => {
  await page.getByRole("button", { name: "Create website" }).click();
  await page.getByLabel("Title:").click();
  await page.getByLabel("Title:").fill("Blog");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("link", { name: "All websites" })).toBeVisible();
  await expect(page.getByText("Search & Sort & Filter")).toBeVisible();
  await expect(page.getByText("Blog Type: Blog Created at:")).toBeVisible();

  await page.getByRole("button", { name: "Create website" }).click();
  await page.getByLabel("Type: BlogDocs").selectOption("Docs");
  await page.getByLabel("Title:").click();
  await page.getByLabel("Title:").fill("Documentation");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("link", { name: "All websites" })).toBeVisible();
  await expect(page.getByText("Search & Sort & Filter")).toBeVisible();
  await expect(page.getByText("Documentation Type: Docs")).toBeVisible();
});

test.describe("Update website", () => {
  test("Update websites", async ({ authenticatedPage: page }) => {
    await page.getByRole("button", { name: "Update" }).nth(1).click();
    await page.getByRole("textbox", { name: "Title" }).click();
    await page.getByRole("textbox", { name: "Title" }).fill("Blog updated");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("link", { name: "Blog updated" })).toBeVisible();

    await page.getByRole("button", { name: "Update" }).first().click();
    await page.getByRole("textbox", { name: "Title" }).click();
    await page.getByRole("textbox", { name: "Title" }).fill("Documentation updated");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("link", { name: "Documentation updated" })).toBeVisible();
  });

  test.describe("Update settings", () => {
    test("Global", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByLabel("Light accent color:").click();
      await page.getByLabel("Light accent color:").fill("#3975a2");
      await page.getByLabel("Dark accent color:").click();
      await page.getByLabel("Dark accent color:").fill("#41473e");
      await page.locator("#global").getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated global")).toBeVisible();
      await page.getByLabel("Favicon:").click();
      await page
        .getByLabel("Favicon:")
        .setInputFiles(join(__dirname, "sample-files", "archtika-logo-512x512.png"));
      await page.locator("#global").getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated global")).toBeVisible();
    });

    test("Header", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByLabel("Logo text:").click();
      await page.getByLabel("Logo text:").fill("archtika Blog updated");
      await page.locator("#header").getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated header")).toBeVisible();
      await page.getByLabel("Logo type: TextImage").selectOption("image");
      await page.getByLabel("Logo image:").click();
      await page
        .getByLabel("Logo image:")
        .setInputFiles(join(__dirname, "sample-files", "archtika-logo-512x512.png"));
      await page.locator("#header").getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated header")).toBeVisible();
    });

    test("Home", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByLabel("Main content:").click();
      await page.getByLabel("Main content:").press("Control+a");
      await page.getByLabel("Main content:").fill("## Some new content comes here");
      await expect(page.getByRole("link", { name: "Some new content comes here" })).toBeVisible();
      await page.locator("#home").getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated home")).toBeVisible();
    });

    test("Footer", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByLabel("Additional text:").click();
      await page
        .getByLabel("Additional text:")
        .fill(
          "archtika is a free, open, modern, performant and lightweight CMS updated content comes here"
        );
      await page.locator("#footer").getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated footer")).toBeVisible();
    });
  });

  test.describe("Articles", () => {
    test("Create article", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByRole("link", { name: "Articles" }).click();
      await page.getByRole("button", { name: "Create article" }).click();
      await page.getByLabel("Title:").click();
      await page.getByLabel("Title:").fill("Test article");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByRole("link", { name: "All articles" })).toBeVisible();
      await expect(page.getByText("Search & Filter")).toBeVisible();
      await expect(page.getByText("Test article Edit Delete")).toBeVisible();
    });

    test("Update article", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByRole("link", { name: "Articles" }).click();
      await page.getByRole("link", { name: "Edit" }).click();
      await page.getByLabel("Description:").click();
      await page.getByLabel("Description:").fill("Sample article description");
      await page.getByLabel("Author:").click();
      await page.getByLabel("Author:").fill("John Doe");
      await page.getByLabel("Main content:").click();
      await page
        .getByLabel("Main content:")
        .fill(
          "## Section\n\n### Subsection\n\n## Second section\n\n### Second subsection\n\n#### Sub Sub section"
        );
      await expect(
        page.getByText("Table of contents SectionSubsectionSecond sectionSecond subsectionSub Sub")
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Section", exact: true }).getByRole("link")
      ).toBeVisible();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated article")).toBeVisible();
    });

    test("Delete article", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Blog" }).click();
      await page.getByRole("link", { name: "Articles" }).click();
      await page.getByRole("button", { name: "Delete" }).click();
      await page.getByRole("button", { name: "Delete article" }).click();
      await expect(page.getByText("Successfully deleted article")).toBeVisible();
    });
  });

  test.describe("Collaborators", () => {
    test("Add collaborator", async ({ authenticatedPage: page }) => {});

    test("Update collaborator", async ({ authenticatedPage: page }) => {});

    test("Delete collaborator", async ({ authenticatedPage: page }) => {});
  });
});

test("Delete websites", async ({ authenticatedPage: page }) => {
  await page.getByRole("button", { name: "Delete" }).nth(1).click();
  await page.getByRole("button", { name: "Delete website" }).click();
  await expect(page.getByText("Successfully deleted website")).toBeVisible();

  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete website" }).click();
  await expect(page.getByText("Successfully deleted website")).toBeVisible();

  await expect(page.getByRole("link", { name: "All websites" })).toBeHidden();
});

test("Delete account", async ({ authenticatedPage: page }) => {
  await page.getByRole("link", { name: "Account" }).click();
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill(password);
  await page
    .locator("#delete-account-modal")
    .getByRole("button", { name: "Delete account" })
    .click();
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});
