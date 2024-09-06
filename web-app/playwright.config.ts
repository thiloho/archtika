import { type PlaywrightTestConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173"
  },
  use: {
    baseURL: "http://localhost:4173",
    video: "retain-on-failure"
  },
  testDir: "tests",
  testMatch: /(.+\.)?(test|spec)\.ts/,
  retries: 3,
  // Firefox and Webkit are not packaged yet, see https://github.com/NixOS/nixpkgs/issues/288826
  projects: [
    {
      name: "Chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
};

export default config;
