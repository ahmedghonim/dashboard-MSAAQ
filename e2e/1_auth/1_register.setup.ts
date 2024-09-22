import { expect } from "@playwright/test";

import test from "@/e2e/test";
import { generateRandomUserDetails } from "@/e2e/utils";
import { expectDashboardHeaderToBeVisible } from "@/e2e/utils/expect";
import routes from "@/e2e/utils/routes";
import { STORAGE_STATE } from "@/playwright.config";

test.describe("Registration Page UI", () => {
  // Go to the register page before each test
  test.beforeEach(async ({ page }) => {
    const pageResponse = await page.goto(routes.auth.register);

    // Expect the page to be loaded successfully
    expect(pageResponse?.status()).toBe(200);

    // Expect the URL to be the register page
    await expect(page).toHaveURL(routes.auth.register);

    // Wait for the page to be loaded
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display the logo", async ({ page }) => {
    await expect(page.getByRole("link", { name: "MSAAQ" })).toBeVisible();
  });

  test("should display the reviews", async ({ page, t }) => {
    await expect(page.getByText(t("auth.review.title"))).toBeVisible();
    await expect(page.getByText(t("auth.review.subtitle"))).toBeVisible();
    await expect(page.getByText(t("customer_reviews.khalida.description"))).toBeVisible();
    await expect(page.getByText(t("auth.review.reviews_total"))).toBeVisible();
  });

  test("should display the registration form", async ({ page, t }) => {
    // Expect the title of the form to be visible
    await expect(page.getByRole("heading", { name: t("auth.sign_up_title") })).toBeVisible();

    // Make sure that the submit button is visible and disabled
    const submitButton = page.getByRole("button", { name: t("auth.sign_up") });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });
});

test.describe("Registration Process", () => {
  const userDetails = generateRandomUserDetails();

  // Go to the register page before each test
  test.beforeEach(async ({ page }) => {
    const pageResponse = await page.goto(routes.auth.register);

    // Expect the page to be loaded successfully
    expect(pageResponse?.status()).toBe(200);

    // Expect the URL to be the register page
    await expect(page).toHaveURL(routes.auth.register);

    // Wait for the page to be loaded
    await page.waitForLoadState("domcontentloaded");
  });

  test("should create a new user and redirect to the dashboard", async ({ page, context, t }) => {
    const { name, email, phone_code, phone, password } = userDetails;

    // Fill the name field
    await page.fill('input[name="name"]', name);

    // Fill the email field
    await page.fill('input[name="email"]', email);

    // Fill the phone number field by:
    // 1. Setting the phone country based on the phone_code value

    // Click the flag dropdown
    await page.locator(".flag-dropdown").click();
    // await page.locator(".selected-flag").click();
    // await page.locator(".flag").click();

    // Search for the phone code
    const searchInput = page.getByPlaceholder(t("search_country_name"));
    await expect(searchInput).toBeVisible();
    await searchInput.fill(phone_code);

    // Click the correct search result
    const correctSearchResult = page.getByRole("option", { name: phone_code });
    await expect(correctSearchResult).toBeVisible();
    await correctSearchResult.click();

    // 2. Setting the phone number to a random number
    await page.fill('input[name="phone"]', phone);

    // Fill the password field
    await page.fill('input[name="password"]', password);

    // Fill the subdomain slug field with the email prefix
    await page.fill('input[name="slug"]', email.split("@")[0]);

    // Make sure that the submit button is enabled
    const submitButton = page.getByRole("button", { name: t("auth.sign_up") });
    await expect(submitButton).toBeEnabled();

    // Capture the request to the register endpoint
    const registerRequest = page.waitForResponse((response) =>
      response.url().includes("/v1/admin/authentication/register")
    );

    // Click the submit button
    await submitButton.click();

    // Wait for the request to finish
    const registerResponse = await registerRequest;

    // Expect the response status to be 200 or 201
    expect([200, 201]).toContain(registerResponse.status());

    // Capture the request to current user endpoint
    const currentUserRequest = page.waitForResponse((response) =>
      response.url().includes("/v1/admin/authentication/me")
    );

    // Make sure that the user is redirected to the dashboard
    await expect(page).toHaveURL(routes.index);

    // Wait for the request to finish
    const currentUserResponse = await currentUserRequest;

    // Expect the response status to be 200
    expect(currentUserResponse.status()).toBe(200);

    // Expect the response to have the correct properties
    const currentUser = await currentUserResponse.json();
    expect(currentUser, '"GET /v1/admin/authentication/me" Does not include the expected properties').toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          user: expect.objectContaining({
            name,
            email,
            phone
          }),
          current_academy: expect.any(Object),
          academies: expect.any(Array)
        })
      })
    );

    // Add the password to the user object (added for testing purposes)
    currentUser.data.user.password = password;

    // Save the current user data object to the cookies
    await context.addCookies([
      {
        name: "currentUser",
        value: JSON.stringify(currentUser.data.user),
        url: process.env.NEXT_PUBLIC_APP_URL as string
      }
    ]);

    // Expect the heading of the main section to be visible
    await expect(page.getByRole("banner").getByText(t("sidebar.main"))).toBeVisible();

    await expectDashboardHeaderToBeVisible(page, t);

    // Save the storage state
    await page.context().storageState({ path: STORAGE_STATE });
  });
});
