import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3100", channel: "chrome", headless: true },
  webServer: { command: "npm run start -- --port 3100", url: "http://127.0.0.1:3100/de", reuseExistingServer: !process.env.CI, timeout: 60000 },
});
