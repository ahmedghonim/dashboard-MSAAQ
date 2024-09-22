import { apiSlice } from "@/store/slices/api/apiSlice";
import { Card, DeepPartial, SetupIntent } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createSubscription: builder.mutation<
      Card,
      { plan_price_id: number; promo_code_id?: string | null; card_id: string | null } | any
    >({
      query: (data) => ({
        url: "/billing/subscription",
        method: "POST",
        data
      }),
      invalidatesTags: () => [{ type: "payment-methods.index", id: "LIST" }]
    }),
    CheckPromoCode: builder.mutation<{ code: string }, DeepPartial<{ code: string }>>({
      query: (data) => ({
        url: "/billing/subscription/valid_promo_code",
        method: "POST",
        data
      })
    }),
    setupIntent: builder.mutation<SetupIntent, void | object>({
      query: (data = {}) => ({
        url: "/billing/stripe/setup-intent",
        method: "GET",
        data
      })
    })
  })
});

export const { useSetupIntentMutation, useCheckPromoCodeMutation, useCreateSubscriptionMutation } = extendedApiSlice;
