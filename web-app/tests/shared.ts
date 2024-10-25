import type { Page } from "@playwright/test";

export const userOwner = "test-owner";
export const userCollab10 = "test-collab10";
export const userCollab20 = "test-collab20";
export const userCollab30 = "test-collab30";
export const userDummy = "test-dummy";

export const collabUsers = new Map([
  [10, userCollab10],
  [20, userCollab20],
  [30, userCollab30]
]);
export const permissionLevels = [10, 20, 30];
export const allUsers = [userOwner, userCollab10, userCollab20, userCollab30, userDummy];
export const password = "T3stinguser?!";
export const contentTypes = ["Blog", "Docs"];
export const collabTestingWebsite = "Collaborator testing";

export const register = async (username: string, page: Page) => {
  await page.goto("/register");
  await page.getByLabel("Username:").click();
  await page.getByLabel("Username:").fill(username);
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill(password);
  await page.getByRole("button", { name: "Register" }).click();
};
export const authenticate = async (username: string, page: Page) => {
  await page.goto("/login");
  await page.getByLabel("Username:").click();
  await page.getByLabel("Username:").fill(username);
  await page.getByLabel("Password:").click();
  await page.getByLabel("Password:").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
};
