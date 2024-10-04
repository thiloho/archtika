import { test as base, expect, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { platform } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const username = randomBytes(8).toString("hex");
const collabUsername = randomBytes(8).toString("hex");
const customPrefix = Buffer.from(randomBytes(16).map((byte) => (byte % 26) + 97)).toString();
const customPrefix2 = Buffer.from(randomBytes(16).map((byte) => (byte % 26) + 97)).toString();
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

test.describe.serial("Website tests", () => {
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
    await expect(page.getByText("Search & Filter")).toBeVisible();
    await expect(page.getByText("Blog Type: Blog Created at:")).toBeVisible();

    await page.getByRole("button", { name: "Create website" }).click();
    await page.getByLabel("Type: BlogDocs").selectOption("Docs");
    await page.getByLabel("Title:").click();
    await page.getByLabel("Title:").fill("Documentation");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("link", { name: "All websites" })).toBeVisible();
    await expect(page.getByText("Search & Filter")).toBeVisible();
    await expect(page.getByText("Documentation Type: Docs")).toBeVisible();
  });

  test("Update websites", async ({ authenticatedPage: page }) => {
    await page.locator("li").filter({ hasText: "Blog" }).getByRole("button").first().click();
    await page.getByRole("textbox", { name: "Title" }).click();
    await page.getByRole("textbox", { name: "Title" }).fill("Blog updated");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("link", { name: "Blog updated" })).toBeVisible();

    await page
      .locator("li")
      .filter({ hasText: "Documentation" })
      .getByRole("button")
      .first()
      .click();
    await page.getByRole("textbox", { name: "Title" }).click();
    await page.getByRole("textbox", { name: "Title" }).fill("Documentation updated");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("link", { name: "Documentation updated" })).toBeVisible();
  });

  test.describe.serial("Blog", () => {
    test.describe.serial("Update settings", () => {
      test("Global", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByLabel("Background color dark theme: ").click();
        await page.getByLabel("Background color dark theme:").fill("#3975a2");
        await page.getByLabel("Background color light theme:").click();
        await page.getByLabel("Background color light theme:").fill("#41473e");
        await page.getByLabel("Accent color dark theme: ").click();
        await page.getByLabel("Accent color dark theme:").fill("#3975a2");
        await page.getByLabel("Accent color light theme:").click();
        await page.getByLabel("Accent color light theme:").fill("#41473e");
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
        await page.getByLabel("Description:").click();
        await page.getByLabel("Description:").fill("Description");
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

    test.describe.serial("Articles", () => {
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
          page.getByText(
            "Table of contents SectionSubsectionSecond sectionSecond subsectionSub Sub"
          )
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: "Section", exact: true }).getByRole("link")
        ).toBeVisible();
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Successfully updated article")).toBeVisible();
      });

      test("Paste image", async ({ authenticatedPage: page, context }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Articles" }).click();
        await page.getByRole("link", { name: "Edit" }).click();
        await page.getByLabel("Main content:").click();

        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        const isMac = platform() === "darwin";
        const modifier = isMac ? "Meta" : "Control";

        const clipPage = await context.newPage();
        await clipPage.goto("https://picsum.photos/400/400.jpg");
        await clipPage.keyboard.press(`${modifier}+C`);

        await page.bringToFront();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Enter");
        await page.keyboard.press(`${modifier}+V`);

        await expect(page.getByText("Successfully uploaded image")).toBeVisible();
      });

      test("Delete article", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Articles" }).click();
        await page.getByRole("button", { name: "Delete" }).click();
        await page.getByRole("button", { name: "Delete article" }).click();
        await expect(page.getByText("Successfully deleted article")).toBeVisible();
      });
    });

    test.describe.serial("Collaborators", () => {
      test("Add collaborator", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Collaborators" }).click();
        await page.getByRole("button", { name: "Add collaborator" }).click();
        await page.getByLabel("Username:").click();
        await page.getByLabel("Username:").fill(collabUsername);
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Successfully added")).toBeVisible();
      });

      test("Update collaborator", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Collaborators" }).click();
        await page.getByRole("button", { name: "Update" }).click();
        await page.getByRole("combobox").selectOption("20");
        await page.getByRole("button", { name: "Update collaborator" }).click();
        await expect(page.getByText("Successfully updated")).toBeVisible();
      });

      test("Remove collaborator", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Collaborators" }).click();
        await page.getByRole("button", { name: "Remove" }).click();
        await page.getByRole("button", { name: "Remove collaborator" }).click();
        await expect(page.getByText("Successfully removed")).toBeVisible();
      });
    });

    test.describe.serial("Legal information", () => {
      test("Create/Update legal information", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Legal information" }).click();
        await page.getByLabel("Main content:").click();
        await page.getByLabel("Main content:").fill("## Content");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Successfully created/updated legal")).toBeVisible();

        await page.getByLabel("Main content:").click();
        await page.getByLabel("Main content:").fill("## Content updated");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Successfully created/updated legal")).toBeVisible();
      });
      test("Delete legal information", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Blog" }).click();
        await page.getByRole("link", { name: "Legal information" }).click();
        await page.getByRole("button", { name: "Delete" }).click();
        await page.getByRole("button", { name: "Delete legal information" }).click();
        await expect(page.getByText("Successfully deleted legal")).toBeVisible();
      });
    });
  });

  test.describe.serial("Docs", () => {
    test.describe.serial("Categories", () => {
      test("Create category", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Documentation" }).click();
        await page.getByRole("link", { name: "Categories" }).click();
        await page.getByRole("button", { name: "Create category" }).click();
        await page.getByLabel("Name:").nth(0).click();
        await page.getByLabel("Name:").nth(0).fill("Category");
        await page.getByLabel("Weight:").click();
        await page.getByLabel("Weight:").fill("1000");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Successfully created category")).toBeVisible();
        await expect(page.getByRole("link", { name: "All categories" })).toBeVisible();
        await expect(page.getByText("Category (1000)")).toBeVisible();
      });
      test("Update category", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Documentation" }).click();
        await page.getByRole("link", { name: "Categories" }).click();
        await page.getByRole("button", { name: "Update" }).click();
        await page.getByRole("spinbutton", { name: "Weight:" }).click();
        await page.getByRole("spinbutton", { name: "Weight:" }).fill("500");
        await page.getByRole("button", { name: "Update category" }).click();
        await expect(page.getByText("Successfully updated category")).toBeVisible();
        await expect(page.getByText("Category (500)")).toBeVisible();
      });
      test("Delete category", async ({ authenticatedPage: page }) => {
        await page.getByRole("link", { name: "Documentation" }).click();
        await page.getByRole("link", { name: "Categories" }).click();
        await page.getByRole("button", { name: "Delete" }).click();
        await page.getByRole("button", { name: "Delete category" }).click();
        await expect(page.getByText("Successfully deleted category")).toBeVisible();
        await expect(page.getByRole("link", { name: "All categories" })).toBeHidden();
      });
    });

    test("Article", async ({ authenticatedPage: page }) => {
      await page.getByRole("link", { name: "Documentation" }).click();
      await page.getByRole("link", { name: "Categories" }).click();
      await page.getByRole("button", { name: "Create category" }).click();
      await page.getByLabel("Name:").nth(0).click();
      await page.getByLabel("Name:").nth(0).fill("Category");
      await page.getByLabel("Weight:").click();
      await page.getByLabel("Weight:").fill("1000");
      await page.getByRole("button", { name: "Submit" }).click();
      await page.getByRole("link", { name: "Articles" }).click();
      await page.getByRole("button", { name: "Create article" }).click();
      await page.getByLabel("Title:").click();
      await page.getByLabel("Title:").fill("Article");
      await page.getByRole("button", { name: "Submit" }).click();
      await page.getByRole("link", { name: "Edit" }).click();
      await page.getByLabel("Weight:").click();
      await page.getByLabel("Weight:").fill("1000");
      await page.getByLabel("Title:").click();
      await page.getByLabel("Title:").fill("Article");
      await page.getByLabel("Description:").click();
      await page.getByLabel("Description:").fill("Testing out this article");
      await page.getByLabel("Author:").click();
      await page.getByLabel("Author:").fill("John Doe");
      await page.getByLabel("Main content:").click();
      await page
        .getByLabel("Main content:")
        .fill(
          "## Main content comes in here\n\n### First section\n\n### Second section\n\n## More"
        );
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Successfully updated article")).toBeVisible();
      await expect(page.getByText("Table of contents Main")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Main content comes in here" }).getByRole("link")
      ).toBeVisible();
    });
  });

  test("Publish websites", async ({ authenticatedPage: page }) => {
    await page.getByRole("link", { name: "Blog" }).click();
    await page.getByRole("link", { name: "Publish" }).click();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Successfully published website")).toBeVisible();
    await expect(page.getByText("Your website is published at")).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Documentation" }).click();
    await page.getByRole("link", { name: "Publish" }).click();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Successfully published website")).toBeVisible();
    await expect(page.getByText("Your website is published at")).toBeVisible();
  });

  test("Set custom domain prefixes", async ({ authenticatedPage: page }) => {
    await page.getByRole("link", { name: "Blog" }).click();
    await page.getByRole("link", { name: "Publish" }).click();
    await page.getByLabel("Prefix:").click();
    await page.getByLabel("Prefix:").fill(customPrefix);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Successfully created/updated")).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Documentation" }).click();
    await page.getByRole("link", { name: "Publish" }).click();
    await page.getByLabel("Prefix:").click();
    await page.getByLabel("Prefix:").fill(customPrefix2);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Successfully created/updated")).toBeVisible();
  });

  test("Remove custom domain prefixes", async ({ authenticatedPage: page }) => {
    await page.getByRole("link", { name: "Blog" }).click();
    await page.getByRole("link", { name: "Publish" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete domain prefix" }).click();
    await expect(page.getByText("Successfully deleted domain")).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Documentation" }).click();
    await page.getByRole("link", { name: "Publish" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete domain prefix" }).click();
    await expect(page.getByText("Successfully deleted domain")).toBeVisible();
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

  test("Delete accounts", async ({ authenticatedPage: page }) => {
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
  });
});
