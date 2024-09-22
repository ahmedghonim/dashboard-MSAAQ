import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIActionResponse, APIResponse, Payout } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAffiliatePayouts: builder.query<APIResponse<Payout>, object | void>({
      query: (params: object = {}) => ({
        url: "/msaaq_affiliates/payouts",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "msaaq_affiliate.index" as const, id })),
              { type: "msaaq_affiliate.index", id: "LIST" }
            ]
          : [{ type: "msaaq_affiliate.index", id: "LIST" }]
    }),
    fetchAffiliatePayout: builder.query<Payout, number | string>({
      query: (id: number | string) => ({
        url: `/msaaq_affiliates/payouts/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Payout }) => response.data,
      providesTags: (result, error, id) => [{ type: "msaaq_affiliate.index", id }]
    }),
    createAffiliatePayout: builder.mutation<APIActionResponse<Payout>, number>({
      query: (amount: number | string) => ({
        url: `/msaaq_affiliates/payouts`,
        method: "POST",
        data: {
          amount
        }
      }),
      invalidatesTags: () => [
        { type: "msaaq_affiliate.index", id: "LIST" },
        { type: "msaaq_affiliate.settings", id: "settings" }
      ]
    })
  })
});

export const { useFetchAffiliatePayoutQuery, useCreateAffiliatePayoutMutation, useFetchAffiliatePayoutsQuery } =
  extendedApiSlice;
