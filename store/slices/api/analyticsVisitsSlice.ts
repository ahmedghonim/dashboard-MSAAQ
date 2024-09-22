import { apiSlice } from "@/store/slices/api/apiSlice";
import { MostVisited, SessionsStats, TopReferrers, VisitsStats } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAnalyticsStats: builder.query<{ data: VisitsStats }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/analytics/stats",
        method: "GET",
        params
      })
    }),
    fetchSessionsPerCountry: builder.query<{ data: SessionsStats }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/analytics/session-countries",
        method: "GET",
        params
      })
    }),
    fetchSessionsPerDevice: builder.query<{ data: SessionsStats }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/analytics/session-devices",
        method: "GET",
        params
      })
    }),
    fetchMostVisited: builder.query<{ data: MostVisited }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/analytics/most-visited-pages",
        method: "GET",
        params
      })
    }),
    fetchTopReferrers: builder.query<{ data: TopReferrers }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/analytics/top-referrers",
        method: "GET",
        params
      })
    })
  })
});

export const {
  useFetchAnalyticsStatsQuery,
  useFetchSessionsPerCountryQuery,
  useFetchSessionsPerDeviceQuery,
  useFetchMostVisitedQuery,
  useFetchTopReferrersQuery
} = extendedApiSlice;
