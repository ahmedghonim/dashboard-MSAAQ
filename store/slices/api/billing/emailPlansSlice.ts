import { apiSlice } from "@/store/slices/api/apiSlice";
import { EmailPlan } from "@/types/models/emailPlan";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchEmailPlans: builder.query<EmailPlan[], object | void>({
      query: (params: object = {}) => ({
        url: "/billing/plans/emails",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: EmailPlan[] }) => response.data
    }),
    purchaseEmailBundle: builder.mutation<any, { plan_price_id: number; card_id: string | null; quantity: number }>({
      query: (data: object = {}) => ({
        url: "/billing/subscription/addons",
        method: "POST",
        data
      })
    })
  })
});

export const { useFetchEmailPlansQuery, usePurchaseEmailBundleMutation } = extendedApiSlice;
