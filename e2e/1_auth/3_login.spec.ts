import { type Page, expect } from "@playwright/test";

import test from "@/e2e/test";
import routes from "@/e2e/utils/routes";

test.describe("Login Page UI", () => {
  test.describe.configure({
    mode: "serial"
  });
  test.use({ storageState: { cookies: [], origins: [] } });

  let page: Page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    const pageResponse = await page.goto(routes.auth.login);

    // Expect the page to be loaded successfully
    const statusCode = pageResponse?.status();
    expect(statusCode, `The page did not load successfully. Status code: ${statusCode}`).toBe(200);

    // Expect the URL to be the register page
    await expect(page).toHaveURL(routes.auth.login);

    // Wait for the page to be loaded
    await page.waitForLoadState("domcontentloaded");
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("should have a form with email and password fields", async ({ t }) => {
    // Email field should be visible
    // Label
    await expect(page.getByText(t("auth.email"))).toBeVisible();

    // Input
    const emailInput = page.getByPlaceholder(t("auth.your_email"));
    await expect(emailInput).toBeVisible();
    // TODO: Uncomment when fixed in Abjad
    // await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toBeEmpty();

    // Password field should be visible
    // Label
    await expect(page.getByText(t("auth.password"))).toBeVisible();

    // Input
    const passwordInput = page.getByPlaceholder(t("auth.your_password"));
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toBeEmpty();
  });

  test("should have a remember me checkbox", async ({ t }) => {
    // Label
    await expect(page.getByText(t("auth.remember_me"))).toBeVisible();

    // Checkbox
    const rememberMeCheckbox = page.getByLabel(t("auth.remember_me"));
    await expect(rememberMeCheckbox).toBeVisible();
    await expect(rememberMeCheckbox).not.toBeChecked();

    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();

    await rememberMeCheckbox.uncheck();
    await expect(rememberMeCheckbox).not.toBeChecked();
  });

  test("should have a link to the forgot password page", async ({ t }) => {
    await expect(page.getByText(t("auth.do_you_forgot_your_password"))).toBeVisible();
    const resetLink = page.getByRole("link", { name: t("auth.do_you_forgot_your_password") });

    await expect(resetLink).toBeVisible();
    // Expect href value to end with the reset page's URL
    await expect(resetLink).toHaveAttribute("href", new RegExp(`${routes.auth.reset.index}$`));
  });

  test("should have a disabled submit button by default", async ({ t }) => {
    const submitButton = page.getByRole("button", { name: t("auth.sign_in") });

    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });

  test("should have an enabled submit button when the form is filled with valid credentials", async ({ t }) => {
    const emailInput = page.getByPlaceholder(t("auth.your_email"));
    const passwordInput = page.getByPlaceholder(t("auth.your_password"));
    const submitButton = page.getByRole("button", { name: t("auth.sign_in") });

    await emailInput.fill("amazing-tester@msaaq.com");
    await passwordInput.fill("password");

    await expect(submitButton).toBeEnabled();
  });

  test("should have a link to the register page", async ({ t }) => {
    await expect(page.getByText(t("auth.you_dont_have_an_account"))).toBeVisible();
    const registerLink = page.getByRole("link", { name: t("auth.signup_now") });

    await expect(registerLink).toBeVisible();
    // Expect href value to end with the register page's URL
    await expect(registerLink).toHaveAttribute("href", new RegExp(`${routes.auth.register}$`));
  });
});

test.describe("Login Process", () => {});
