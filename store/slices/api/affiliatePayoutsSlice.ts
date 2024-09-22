import { DeepPartial } from "react-hook-form";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse } from "@/types";
import { AffiliatePayout } from "@/types/models/affiliatePayout";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAffiliatePayouts: builder.query<APIResponse<AffiliatePayout>, object | void>({
      query: (params: object = {}) => ({
        url: "/affiliates/payouts",
        method: "GET",
        params
      })
    }),
    fetchAffiliatePayout: builder.query<AffiliatePayout, number | string>({
      query: (id: number | string) => ({
        url: `/affiliates/payouts/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: AffiliatePayout }) => response.data
    }),
    updateAffiliatePayout: builder.mutation<
      AffiliatePayout,
      Pick<AffiliatePayout, "id"> & Omit<DeepPartial<AffiliatePayout>, "id"> & { "deleted-receipt"?: number | number[] }
    >({
      query: ({ id, ...payout }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/affiliates/payouts/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(payout)
      })
    })
  })
});

export const { useFetchAffiliatePayoutQuery, useUpdateAffiliatePayoutMutation, useFetchAffiliatePayoutsQuery } =
  extendedApiSlice;
