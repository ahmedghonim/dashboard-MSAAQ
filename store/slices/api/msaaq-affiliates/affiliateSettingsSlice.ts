import { apiSlice } from "@/store/slices/api/apiSlice";
import { MsaaqAffiliateSettings } from "@/types/models/msaaqAffiliateSettings";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAffiliatesSettings: builder.query<MsaaqAffiliateSettings, object | void>({
      query: (params: object = {}) => ({
        url: "/msaaq_affiliates/info",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: MsaaqAffiliateSettings }) => response.data,
      providesTags: () => [{ type: "msaaq_affiliate.settings", id: "settings" }]
    })
  })
});

export const { useFetchAffiliatesSettingsQuery } = extendedApiSlice;
