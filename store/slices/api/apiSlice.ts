import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/lib/axios";

export const tagTypes = [
  "products.index",
  "courses.index",
  "enrollments.index",
  "chapters.index",
  "chapters.content",
  "taxonomies.index",
  "videos.index",
  "blog.index",
  "coupons.index",
  "members.index",
  "member.downloads.index",
  "certificates.index",
  "certificates_templates.index",
  "quizzes.index",
  "questions.index",
  "academy.translations.index",
  "notifications.settings",
  "notifications.index",
  "msaaqpay.settings",
  "orders.index",
  "bank_transfers.index",
  "entity.index",
  "affiliate.index",
  "msaaq_affiliate.index",
  "msaaq_affiliate.settings",
  "apps.index",
  "users.index",
  "comments.index",
  "reviews.index",
  "announcements.index",
  "onboarding.index",
  "appointments.index",
  "receipts.index",
  "payment-methods.index",
  "apps.properties",
  "domains.index",
  "nelc_products.index",
  "onboarding.register",
  "onboarding.checklist",
  "segments.index",
  "abandoned_carts.reminders.index",
  "transactions.index",
  "home.index",
  "campaigns.index",
  "campaigns.sends"
] as const;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: tagTypes,
  endpoints: (builder) => ({})
});
