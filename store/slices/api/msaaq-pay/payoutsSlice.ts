import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIActionResponse, APIResponse, Payout, PayoutSettings } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchPayouts: builder.query<APIResponse<Payout>, object | void>({
      query: (params: object = {}) => ({
        url: "/msaaqpay/payouts",
        method: "GET",
        params
      })
    }),
    fetchPayout: builder.query<Payout, number | string>({
      query: (id: number | string) => ({
        url: `/msaaqpay/payouts/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Payout }) => response.data
    }),
    fetchPayoutSettings: builder.query<PayoutSettings, void>({
      query: () => ({
        url: `/msaaqpay/payouts/settings`,
        method: "GET"
      }),
      transformResponse: (response: { data: PayoutSettings }) => response.data
    }),
    createPayout: builder.mutation<APIActionResponse<Payout>, number>({
      query: (amount: number | string) => ({
        url: `/msaaqpay/payouts`,
        method: "POST",
        data: {
          amount
        }
      })
    })
  })
});

export const { useFetchPayoutQuery, useFetchPayoutsQuery, useCreatePayoutMutation, useFetchPayoutSettingsQuery } =
  extendedApiSlice;
