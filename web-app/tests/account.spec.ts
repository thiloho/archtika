import { test, expect } from "@playwright/test";

test("Register", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByLabel("Username:").click();
  await page.getByLabel("Username:").fill("archtika-test");
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill("T3stuser??!!");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Successfully registered, you")).toBeVisible();
});

test("Login", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByLabel("Username:").click();
  await page.getByLabel("Username:").fill("archtika-test");
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill("T3stuser??!!");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("Logout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByLabel("Username:").click();
  await page.getByLabel("Username:").fill("archtika-test");
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill("T3stuser??!!");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Account" }).click();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test("Delete account", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByLabel("Username:").click();
  await page.getByLabel("Username:").fill("archtika-test");
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill("T3stuser??!!");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.getByRole("link", { name: "Account" }).click();
  await page.getByRole("button", { name: "Delete account" }).click();
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill("T3stuser??!!");
  await page
    .locator("#delete-account-modal")
    .getByRole("button", { name: "Delete account" })
    .click();
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test("Register after account deletion", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByLabel("Username:").click();
  await page.getByLabel("Username:").fill("archtika-test");
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill("T3stuser??!!");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Successfully registered, you")).toBeVisible();
});
