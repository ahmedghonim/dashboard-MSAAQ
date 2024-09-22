module.exports = {
  // debug: process.env.NODE_ENV === "development",
  debug: false,
  reloadOnPrerender: process.env.NODE_ENV === "development",
  i18n: {
    locales: ["ar", "en"],
    defaultLocale: "ar",
    localeDetection: false
  },
  /**
   * To avoid issues when deploying to some paas (vercel...)
   */
  localePath: typeof window === "undefined" ? require("path").resolve("./public/locales") : "/locales"
};
