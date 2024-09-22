import { expect } from "@playwright/test";

import test from "@/e2e/test";
import { getFullDashboardUrl } from "@/e2e/utils";
import routes from "@/e2e/utils/routes";

import { expectDashboardHeaderToBeVisible } from "../utils/expect";

test.describe("Logout Process", () => {
  test("should log out the user", async ({ page, t }) => {
    // Go to the index page
    await page.goto(routes.index);

    // Expect the dashboard header to be visible
    await expectDashboardHeaderToBeVisible(page, t);

    // Click the user dropdown button
    await page.getByRole("button", { name: t("user_dropdown.hello") }).click();

    // Make sure that the logout button is visible
    const logoutButton = page.getByRole("menuitem", { name: t("user_dropdown.logout") });
    await expect(logoutButton).toBeVisible();

    // Click the logout button
    await logoutButton.click();

    // Expect to be redirected to the login page
    await expect(page).toHaveURL(`${routes.auth.login}?callbackUrl=${getFullDashboardUrl(routes.index, true)}`);
  });
});

test.describe("Logged Out State", () => {
  test("should redirect to the login page", async ({ page }) => {
    // Go to the index page
    await page.goto(routes.index);
    // Expect to be redirected to the login page
    await expect(page).toHaveURL(`${routes.auth.login}?callbackUrl=${getFullDashboardUrl(routes.index, true)}`);
  });

  test("should redirect to the login page with the correct callbackUrl parameter", async ({ page }) => {
    // Go to the index page
    await page.goto(routes.index);
    // Expect to be redirected to the login page with a callbackUrl parameter to the index page
    await expect(page).toHaveURL(`${routes.auth.login}?callbackUrl=${getFullDashboardUrl(routes.index, true)}`);

    // Go to the courses page
    await page.goto(routes.courses.index);
    // Expect to be redirected to the login page with a callbackUrl parameter to the courses page
    await expect(page).toHaveURL(`${routes.auth.login}?callbackUrl=${getFullDashboardUrl(routes.courses.index, true)}`);

    // Go to the course chapters page
    const courseChaptersPath = routes.courses.courseId("100").chapters.index;
    await page.goto(courseChaptersPath);
    // Expect to be redirected to the login page with a callbackUrl parameter to the course chapters page
    await expect(page).toHaveURL(`${routes.auth.login}?callbackUrl=${getFullDashboardUrl(courseChaptersPath, true)}`);

    // Go to the course chapter page
    const courseChapterContentsCreateVideoPath = routes.courses.courseId("100").chapters.chapterId("200").contents
      .video.create;
    await page.goto(courseChapterContentsCreateVideoPath);
    // Expect to be redirected to the login page with a callbackUrl parameter to the course chapter page
    await expect(page).toHaveURL(
      `${routes.auth.login}?callbackUrl=${getFullDashboardUrl(courseChapterContentsCreateVideoPath, true)}`
    );
  });
});
