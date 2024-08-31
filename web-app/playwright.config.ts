import { type PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173"
  },
  use: {
    baseURL: "http://localhost:4173"
  },
  testDir: "tests",
  testMatch: /(.+\.)?(test|spec)\.ts/
};

export default config;
