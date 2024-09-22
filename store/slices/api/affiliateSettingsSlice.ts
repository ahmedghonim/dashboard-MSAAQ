import { apiSlice } from "@/store/slices/api/apiSlice";
import { AffiliateSettings } from "@/types/models/affiliateSettings";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAffiliatesSettings: builder.query<AffiliateSettings, object | void>({
      query: (params: object = {}) => ({
        url: "/affiliates/settings",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: AffiliateSettings }) => response.data,
      providesTags: ["affiliate.index"]
    }),
    updateAffiliateSettings: builder.mutation<any, any>({
      query: (affiliateSettings) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/affiliates/settings`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(affiliateSettings)
      }),
      invalidatesTags: ["affiliate.index"]
    })
  })
});

export const { useFetchAffiliatesSettingsQuery, useUpdateAffiliateSettingsMutation } = extendedApiSlice;
