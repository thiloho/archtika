import { test as base, expect, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";

const username = randomBytes(8).toString("hex");
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

test.describe.serial("Account tests", () => {
  test("Register", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(username);
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Successfully registered, you")).toBeVisible();
  });

  test("Login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Username:").click();
    await page.getByLabel("Username:").fill(username);
    await page.getByLabel("Password:").click();
    await page.getByLabel("Password:").fill(password);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("Logout", async ({ authenticatedPage: page }) => {
    await page.getByRole("link", { name: "Account" }).click();
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
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
});
