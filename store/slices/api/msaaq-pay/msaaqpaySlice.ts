import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIActionResponse, MsaaqPayInfo } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchMsaaqPaySettings: builder.query<MsaaqPayInfo, object | void>({
      query: (params: object = {}) => ({
        url: "/msaaqpay/setting",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: MsaaqPayInfo }) => response.data,
      providesTags: ["msaaqpay.settings"]
    }),
    fetchMsaaqPayStats: builder.query<any, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/msaaqpay/stats",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: any }) => response.data
    }),
    fetchMsaaqPaySalesChart: builder.query<any, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/msaaqpay/sales-chart",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: any }) => response.data
    }),
    updateMsaaqPaySettings: builder.mutation<APIActionResponse<MsaaqPayInfo>, object>({
      query: (data) => ({
        url: "/msaaqpay/setting",
        method: "PUT",
        data
      }),
      invalidatesTags: ["msaaqpay.settings"]
    })
  })
});

export const {
  useFetchMsaaqPaySettingsQuery,
  useFetchMsaaqPayStatsQuery,
  useUpdateMsaaqPaySettingsMutation,
  useFetchMsaaqPaySalesChartQuery
} = extendedApiSlice;
