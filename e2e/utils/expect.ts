import { type Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { type TFunction } from "next-i18next";
import { type TypeOptions as ToastTypeOptions } from "react-toastify";

export const expectDashboardHeaderToBeVisible = async (page: Page, t: TFunction): Promise<void> => {
  // Expect the search bar to be visible
  await expect(page.getByText(t("search_input_placeholder")), "Search bar is not visible").toBeVisible();

  // Expect Preview Tenant button to be visible
  await expect(
    page.getByRole("button", { name: t("user_dropdown.preview") }),
    "Preview Tenant button is not visible"
  ).toBeVisible();

  // Expect the user dropdown button to be visible
  await expect(
    page.getByRole("button", { name: t("user_dropdown.hello") }),
    "User dropdown button is not visible"
  ).toBeVisible();
};

// TODO: Ensure that all class names are correct
export const expectToastToBeVisible = async (page: Page, type: ToastTypeOptions): Promise<void> => {
  let selector = '[role="alert"].ms-alert';
  switch (type) {
    case "success":
      selector += ".ms-alert-success";
      break;
    case "error":
      selector += ".ms-alert-danger";
      break;
    case "info":
      selector += ".ms-alert-info";
      break;
    case "warning":
      selector += ".ms-alert-warning";
      break;
    default:
      selector += ".ms-alert-default";
  }

  const toast = await page.waitForSelector(selector, { state: "visible" });
  expect(toast.isVisible(), `Toast with type "${type}" is not visible.`).toBeTruthy();
};
