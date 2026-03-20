import { expect, test } from "@playwright/test";

test.describe("public product surfaces", () => {
  test("landing page renders the core product story", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/PulseBoard/i);
    await expect(
      page.getByRole("heading", { name: /see what slack conversations really mean/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /connect with slack/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /see how it works/i })).toBeVisible();
  });

  test("connect page exposes the install and sign-in actions", async ({ page }) => {
    await page.goto("/connect");

    await expect(
      page.getByRole("heading", { name: /get started with pulseboard/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /add to slack/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in with slack/i })).toBeVisible();
  });
});
