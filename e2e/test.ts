import { test as base } from "@playwright/test";
import { createI18nFixture } from "playwright-i18next-fixture";

import i18nAr from "@/public/locales/ar/common.json";

const i18Fixture = createI18nFixture({
  options: {
    debug: false,
    ns: ["common"],
    lng: "ar",
    cleanCode: true,
    resources: {
      ar: {
        common: i18nAr
      }
    }
  },
  cache: true,
  auto: true
});

const test = base.extend(i18Fixture);

export default test;
