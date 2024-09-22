export namespace Permissions {
  export enum ACADEMIES {
    VIEW = "academies.view",
    CREATE = "academies.create",
    UPDATE = "academies.update",
    DELETE = "academies.delete",
    DASHBOARD = "academies.dashboard",
    EXPORT = "academies.export"
  }

  export enum ROLES {
    VIEW = "roles.view",
    CREATE = "roles.create",
    UPDATE = "roles.update",
    DELETE = "roles.delete",
    EXPORT = "roles.export"
  }

  export enum USERS {
    VIEW = "users.view",
    CREATE = "users.create",
    UPDATE = "users.update",
    DELETE = "users.delete",
    EXPORT = "users.export"
  }

  export enum MEMBERS {
    VIEW = "members.view",
    CREATE = "members.create",
    UPDATE = "members.update",
    DELETE = "members.delete",
    EXPORT = "members.export",
    IMPORT = "members.import",
    CERTIFICATES_VIEW = "members.certificates.view",
    CERTIFICATES_CREATE = "members.certificates.create",
    CERTIFICATES_UPDATE = "members.certificates.update",
    CERTIFICATES_DELETE = "members.certificates.delete",
    CERTIFICATES_EXPORT = "members.certificates.export",
    ASSIGNMENTS_VIEW = "members.assignments.view",
    ASSIGNMENTS_EXPORT = "members.assignments.export",
    QUIZZES_VIEW = "members.quizzes.view",
    QUIZZES_EXPORT = "members.quizzes.export",
    NOTIFICATIONS = "members.notifications"
  }

  export enum BLOG {
    VIEW = "blog.view",
    CREATE = "blog.create",
    UPDATE = "blog.update",
    DELETE = "blog.delete",
    EXPORT = "blog.export"
  }

  export enum COURSES {
    VIEW = "courses.view",
    CREATE = "courses.create",
    UPDATE = "courses.update",
    DELETE = "courses.delete",
    CONTENTS = "courses.contents",
    LANDING_PAGES = "courses.landing_pages",
    SETTINGS = "courses.settings",
    ASSIGNMENTS = "courses.assignments",
    QUIZZES = "courses.quizzes",
    INSTRUCTORS = "courses.instructors",
    COMMUNITY = "courses.community",
    EXPORT = "courses.export"
  }

  export enum PRODUCTS {
    VIEW = "products.view",
    CREATE = "products.create",
    UPDATE = "products.update",
    DELETE = "products.delete",
    EXPORT = "products.export"
  }
  export enum COACHING_SESSIONS {
    VIEW = "products-coaching-sessions.view",
    CREATE = "products-coaching-sessions.create",
    UPDATE = "products-coaching-sessions.update",
    DELETE = "products-coaching-sessions.delete",
    EXPORT = "products-coaching-sessions.export"
  }

  export enum DIFFICULTIES {
    VIEW = "difficulties.view",
    CREATE = "difficulties.create",
    UPDATE = "difficulties.update",
    DELETE = "difficulties.delete",
    EXPORT = "difficulties.export"
  }

  export enum CATEGORIES {
    VIEW = "categories.view",
    CREATE = "categories.create",
    UPDATE = "categories.update",
    DELETE = "categories.delete",
    EXPORT = "categories.export"
  }

  export enum TAGS {
    VIEW = "tags.view",
    CREATE = "tags.create",
    UPDATE = "tags.update",
    DELETE = "tags.delete",
    EXPORT = "tags.export"
  }

  export enum MARKETING_APPS {
    VIEW = "marketing-apps.view",
    INSTALL = "marketing-apps.install",
    UNINSTALL = "marketing-apps.uninstall"
  }

  export enum PAYMENT_APPS {
    VIEW = "payment-apps.view",
    INSTALL = "payment-apps.install",
    UNINSTALL = "payment-apps.uninstall"
  }

  export enum COUPONS {
    VIEW = "coupons.view",
    CREATE = "coupons.create",
    UPDATE = "coupons.update",
    DELETE = "coupons.delete",
    EXPORT = "coupons.export"
  }

  export enum AFFILIATE {
    MANAGE = "affiliate.manage"
  }

  export enum ORDERS {
    VIEW = "orders.view",
    CREATE = "orders.create",
    UPDATE = "orders.update",
    DELETE = "orders.delete",
    EXPORT = "orders.export"
  }

  export enum MSAAQPAY {
    DASHBOARD = "msaaqpay.dashboard",
    ENABLE = "msaaqpay.enable",
    DISABLE = "msaaqpay.disable",
    MANAGE = "msaaqpay.manage",
    TRANSACTIONS = "msaaqpay.transactions",
    EXPORT = "msaaqpay.export"
  }

  export enum SETTINGS {
    GENERAL = "settings.general",
    DOMAIN = "settings.domain",
    TRANSLATIONS = "settings.translations",
    CODE_SNIPPETS = "settings.code_snippets",
    PAYMENT = "settings.payment",
    SUBSCRIPTION = "settings.subscription",
    VERIFICATION = "settings.verification"
  }

  export enum BUILDER {
    VIEW = "builder.view"
  }

  export enum VIDEOS {
    VIEW = "videos.view",
    CREATE = "videos.create",
    UPDATE = "videos.update",
    DELETE = "videos.delete",
    EXPORT = "videos.export"
  }

  export enum ANALYTICS_APPS {
    VIEW = "analytics-apps.view",
    INSTALL = "analytics-apps.install",
    UNINSTALL = "analytics-apps.uninstall"
  }

  export enum EMAILS_APPS {
    VIEW = "emails-apps.view",
    INSTALL = "emails-apps.install",
    UNINSTALL = "emails-apps.uninstall"
  }

  export enum SUPPORT_APPS {
    VIEW = "support-apps.view",
    INSTALL = "support-apps.install",
    UNINSTALL = "support-apps.uninstall"
  }

  export enum ANALYTICS {
    PRODUCTS = "analytics.products",
    EARNINGS = "analytics.earnings",
    CUSTOMERS = "analytics.customers"
  }
}

type ValueOf<T> = T[keyof T];

// Generate union type of all permission values
type PermissionValues =
  | ValueOf<typeof Permissions.ACADEMIES>
  | ValueOf<typeof Permissions.ROLES>
  | ValueOf<typeof Permissions.USERS>
  | ValueOf<typeof Permissions.MEMBERS>
  | ValueOf<typeof Permissions.BLOG>
  | ValueOf<typeof Permissions.COURSES>
  | ValueOf<typeof Permissions.PRODUCTS>
  | ValueOf<typeof Permissions.COACHING_SESSIONS>
  | ValueOf<typeof Permissions.DIFFICULTIES>
  | ValueOf<typeof Permissions.CATEGORIES>
  | ValueOf<typeof Permissions.TAGS>
  | ValueOf<typeof Permissions.MARKETING_APPS>
  | ValueOf<typeof Permissions.PAYMENT_APPS>
  | ValueOf<typeof Permissions.COUPONS>
  | ValueOf<typeof Permissions.AFFILIATE>
  | ValueOf<typeof Permissions.ORDERS>
  | ValueOf<typeof Permissions.MSAAQPAY>
  | ValueOf<typeof Permissions.SETTINGS>
  | ValueOf<typeof Permissions.BUILDER>
  | ValueOf<typeof Permissions.VIDEOS>
  | ValueOf<typeof Permissions.ANALYTICS_APPS>
  | ValueOf<typeof Permissions.EMAILS_APPS>
  | ValueOf<typeof Permissions.SUPPORT_APPS>
  | ValueOf<typeof Permissions.ANALYTICS>;

// Define Permission type using the generated union type
export type Permission = {
  id: number;
  name: PermissionValues;
};
