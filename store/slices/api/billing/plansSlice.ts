import { apiSlice } from "@/store/slices/api/apiSlice";
import { Plan } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchPlans: builder.query<Plan[], object | void>({
      query: (params: object = {}) => ({
        url: "/billing/plans",
        method: "GET",
        params
      }),
      transformResponse: (response: { data: Plan[] }) => response.data
    })
  })
});

export const { useFetchPlansQuery } = extendedApiSlice;
