import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Chart, OrdersChart, OrdersStats } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchEarningsStats: builder.query<{ data: OrdersStats }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/orders/stats",
        method: "GET",
        params
      })
    }),
    fetchSalesDataChart: builder.query<{ data: Chart }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/orders/sales-chart",
        method: "GET",
        params
      })
    }),
    fetchOrdersDataChart: builder.query<{ data: OrdersChart }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/orders/chart",
        method: "GET",
        params
      })
    }),
    fetchTopDaysChart: builder.query<
      Omit<APIResponse<{ count: number; day: string }>, "meta" | "links">,
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/orders/top-days",
        method: "GET",
        params
      })
    }),
    fetchTopSourcesChart: builder.query<
      Omit<APIResponse<{ label: string; value: number }>, "meta" | "links">,
      object | void
    >({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/orders/top-sources",
        method: "GET",
        params
      })
    })
  })
});

export const {
  useFetchEarningsStatsQuery,
  useFetchSalesDataChartQuery,
  useFetchOrdersDataChartQuery,
  useFetchTopDaysChartQuery,
  useFetchTopSourcesChartQuery
} = extendedApiSlice;
