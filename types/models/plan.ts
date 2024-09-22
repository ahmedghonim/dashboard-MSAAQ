type Price = {
  id: number;
  currency: string;
  paddle_id: string;
  stripe_id: string;
  price: number;
  interval: "monthly" | "yearly";
};

export enum AddonType {
  WEBINARS = "webinars",
  PRODUCTS_BUNDLES = "products-bundles",
  DEFAULT_TEXT_CUSTOMIZATION = "default-text-customization",
  CODE_SNIPPETS = "add-custom-codes",
  SUBDOMAIN = "free-subdomain",
  CUSTOM_DOMAIN = "custom-domain"
}

type AddonSlug =
  | "courses"
  | "students"
  | "products-digital"
  | "users"
  | "statistics"
  | "certificates"
  | "app.unbranded"
  | "support"
  | "support.private"
  | "courses.drip-content"
  | "courses.drip-content.specific-date"
  | "courses.contents.zoom"
  | "courses.contents.zoom.notifications"
  | "courses.contents.video"
  | "courses.contents.pdf"
  | "courses.contents.audio"
  | "courses.contents.quiz"
  | "courses.attachments"
  | "video-library.storage"
  | "articles"
  | "assessments"
  | "quizzes"
  | "quizzes.passing-score"
  | "quizzes.duration"
  | "quizzes.show_results"
  | "quizzes.randomise"
  | "students.notifications"
  | "certificates.meetings-attendance"
  | "coupons"
  | "affiliates"
  | "affiliates.settings.payouts"
  | "sms"
  | "seo"
  | "multi-currencies"
  | "carts.abandoned"
  | "carts.abandoned.reminders"
  | "campaigns"
  | "share-revenue"
  | "upsells"
  | "community"
  | "app.restrict-login-ip"
  | "products-bundles"
  | "products-sessions"
  | "users.extra"
  | "domains.subdomain"
  | "domains.custom"
  | "translations"
  | "code-snippets"
  | "builder"
  | "apps.nelc"
  | "apps.google-analytics"
  | "apps.facebook-pixel"
  | "apps.snapchat-pixel"
  | "apps.mailchimp"
  | "apps.salla"
  | "apps.linkaraby"
  | "apps.google-tag-manager"
  | "apps.convertkit"
  | "apps.zapier"
  | "apps.zoom"
  | "webhooks"
  | "api"
  | "apps.msaaq-pay"
  | "apps.stripe"
  | "apps.paypal"
  | "apps.tap"
  | "apps.paylink"
  | "apps.myfatoorah"
  | "apps.paddle"
  | "apps.tamara"
  | "apps.bank-transfer"
  | "analytics.most-ordering-days"
  | "analytics.export"
  | "analytics.source"
  | "support.helpdesk"
  | "forms.complete-profile"
  | "quizzes.allow_question_navigation"
  | "quizzes.disable_show_results"
  | "questions-banks"
  | "video-library.watermarking"
  | "surveys"
  | "quizzes.passing_rate"
  | "multilingual"
  | "courses.on-site"
  | "segments";

export type Addon = {
  id: number;
  group: string;
  slug: AddonSlug;
  sort: number;
  title: string;
  described_title: string;
  comparison_label: string;
  is_available: boolean;
  level: "page" | "item" | "block" | "mini" | "button";
  limit: null | string | boolean;
  limit_options: { unit?: string };
  limit_type: "integer" | "boolean" | "string";
  usage: "integer";
};

export enum Plans {
  BASIC = "basic",
  PRO = "pro",
  GROWTH = "growth",
  ADVANCED = "advanced"
}

export type Plan = {
  id: number;
  slug: Plans;
  title: string;
  addons: Addon[];
  prices: Price[];
  category: "plus";
};
