import { defineConfig, devices } from "@playwright/test";

/**
 * Desktop visual-regression harness.
 *
 * Its only job is to prove that the mobile work did not change how the
 * dashboard renders at desktop widths. Capture baselines on `main` BEFORE
 * merging any mobile phase:
 *
 *   E2E_AUTH_TOKEN=<educator jwt> npm run test:e2e:update
 *
 * then re-run `npm run test:e2e` after each phase.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },

  // 1440x900 is the reference desktop width the baselines are judged at.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],

  expect: {
    toHaveScreenshot: {
      // Absorbs sub-pixel font rendering noise without hiding real layout shifts.
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
