import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, CustomersStats, Member, MembersChart, MembersCountry } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCustomersStats: builder.query<{ data: CustomersStats }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/customers/stats",
        method: "GET",
        params
      })
    }),
    fetchCustomersDataChart: builder.query<{ data: MembersChart }, object | void>({
      query: (params: object = {}) => ({
        url: "/dashboards/reports/customers/chart",
        method: "GET",
        params
      })
    }),
    fetchMostMembers: builder.query<APIResponse<Member>, object | void>({
      query: (params: object = {}) => ({
        url: `/dashboards/reports/customers/most-orders`,
        method: "GET",
        params
      })
    }),
    fetchMembersCountry: builder.query<{ data: MembersCountry }, object | void>({
      query: (params: object = {}) => ({
        url: `/dashboards/reports/customers/members-country`,
        method: "GET",
        params
      })
    })
  })
});

export const {
  useFetchCustomersStatsQuery,
  useFetchCustomersDataChartQuery,
  useFetchMostMembersQuery,
  useFetchMembersCountryQuery
} = extendedApiSlice;
