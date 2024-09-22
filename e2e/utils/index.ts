import { faker } from "@faker-js/faker/locale/ar";

import { type ContextCookies } from "@/e2e/types";
import type { Academy, User } from "@/types";

export const generateRandomUserDetails = (): {
  name: string;
  email: string;
  phone_code: string;
  phone: string;
  password: string;
} => {
  const now = new Date().toISOString();

  return {
    name: `Test Tenant ${now}`,
    email:
      // => "qa+test_tenant_2023_02_06_04_17_01@msaaq.com"
      process.env.TEST_EMAIL_PREFIX +
      `+test_tenant_${now.replace(/[^0-9]/g, "_").slice(0, -1)}@` +
      process.env.TEST_EMAIL_DOMAIN,
    phone_code: "+966",
    phone: faker.helpers.fromRegExp(/56[5-9]{3}[0-9]{4}/),
    password: faker.internet.password()
  };
};

export const getCurrentUserFromCookies = async (
  page: any
): Promise<{
  user: User;
  current_academy: Academy;
  academies: Array<Academy>;
} | null> => {
  const cookies: ContextCookies = await page.context().cookies();
  const userCookie = cookies.find((cookie) => cookie.name === "currentUser");

  return userCookie ? JSON.parse(decodeURIComponent(userCookie.value)) : null;
};

export const getFullDashboardUrl = (path: string, encode?: boolean): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL}${normalizedPath}`;

  return encode ? encodeURIComponent(url) : url;
};
