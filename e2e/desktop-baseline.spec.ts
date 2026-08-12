import { test, expect } from "@playwright/test";

/**
 * Desktop baselines — the safety net for "keep the desktop UI untouched".
 *
 * One route per archetype rather than all 30, so the suite stays fast enough
 * to run after every phase. Each shared primitive we edit (ui/dialog.tsx,
 * ui/table.tsx, ui/button.tsx) is exercised by at least one of these.
 */

const AUTH_TOKEN = process.env.E2E_AUTH_TOKEN;

const ROUTES = [
  { name: "home-tabbed", path: "/dashboard" },
  { name: "students-9col-table", path: "/dashboard/students" },
  { name: "test-series-11col-table", path: "/dashboard/test-series" },
  { name: "courses-live-paginated", path: "/dashboard/courses/live" },
  { name: "courses-webinar", path: "/dashboard/courses/webinar" },
  { name: "questions-bank", path: "/dashboard/questions" },
  { name: "content-videos", path: "/dashboard/content/videos" },
  { name: "revenue-cards", path: "/dashboard/revenue" },
  { name: "manage-queries", path: "/dashboard/manage-queries" },
];

test.describe("desktop rendering is unchanged", () => {
  test.skip(
    !AUTH_TOKEN,
    "Set E2E_AUTH_TOKEN to an educator JWT to run desktop baselines."
  );

  test.beforeEach(async ({ page }) => {
    // Auth is a plain localStorage bearer token, so we can skip the login UI.
    await page.addInitScript((token) => {
      window.localStorage.setItem("faculty-pedia-auth-token", token as string);
      window.localStorage.setItem("user-role", "educator");
    }, AUTH_TOKEN);
  });

  for (const route of ROUTES) {
    test(route.name, async ({ page }) => {
      await page.goto(route.path);

      // Wait out the spinners rather than racing them.
      await page
        .locator(".animate-spin")
        .first()
        .waitFor({ state: "detached", timeout: 30_000 })
        .catch(() => {
          /* page may never show a spinner */
        });

      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
      });
    });
  }
});
