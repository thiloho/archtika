import { type PlaywrightTestConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://127.0.0.1:4173"
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    video: "retain-on-failure"
  },
  testDir: "./tests",
  testMatch: /(.+\.)?(test|spec)\.ts/,
  workers: 1,
  retries: 3,
  // https://github.com/NixOS/nixpkgs/issues/288826
  projects: [
    {
      name: "Register users",
      testMatch: /global-setup\.ts/,
      teardown: "Delete users"
    },
    {
      name: "Delete users",
      testMatch: /global-teardown\.ts/
    },
    {
      name: "Chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["Register users"]
    },
    {
      name: "Firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["Register users"]
    }
    /*
    Upstream bug "Error: browserContext.newPage: Target page, context or browser has been closed"
    {
      name: "Webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["Register users"]
    } */
  ]
};

export default config;
