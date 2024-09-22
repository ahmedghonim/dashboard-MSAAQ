import { apiSlice } from "@/store/slices/api/apiSlice";
import { CampaignsStats } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCampaignsStats: builder.query<{ data: CampaignsStats }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/campaigns/stats",
        method: "GET",
        params
      })
    })
  })
});

export const { useFetchCampaignsStatsQuery } = extendedApiSlice;
