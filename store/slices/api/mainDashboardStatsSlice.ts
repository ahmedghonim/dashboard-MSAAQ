import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Chart, Stats, bestSellers } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchBestSellingProducts: builder.query<APIResponse<bestSellers>, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/main/best-selling",
        method: "GET",
        params
      }),
      providesTags: ["home.index"]
    }),
    fetchStats: builder.query<{ data: Stats }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/main/stats",
        method: "GET",
        params
      }),
      providesTags: ["home.index"]
    }),
    fetchSalesDataChart: builder.query<{ data: Chart }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/main/sales-chart",
        method: "GET",
        params
      }),
      providesTags: ["home.index"]
    })
  })
});

export const { useFetchBestSellingProductsQuery, useFetchSalesDataChartQuery, useFetchStatsQuery } = extendedApiSlice;
