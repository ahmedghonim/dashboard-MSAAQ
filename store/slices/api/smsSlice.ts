import { apiSlice } from "@/store/slices/api/apiSlice";
import { Card, Plan } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchSmsBundles: builder.query<
      {
        data: any[];
        meta: {
          sms_amount: number;
          sms_enabled: boolean;
        };
      },
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/sms/bundles",
        method: "GET",
        params
      })
    }),
    updateSmsSettings: builder.mutation<
      any,
      {
        sms_enabled: boolean;
      }
    >({
      query: (data) => ({
        url: `/sms/settings`,
        method: "PUT",
        data: convertBooleans(data)
      })
    }),
    purchaseSmsBundle: builder.mutation<any, { plan_price_id: number; card_id: string | null }>({
      query: (data) => ({
        url: "/sms/purchase",
        method: "POST",
        data
      })
    })
  })
});

export const { useFetchSmsBundlesQuery, useUpdateSmsSettingsMutation, usePurchaseSmsBundleMutation } = extendedApiSlice;
