import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Enrollment } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchEnrollments: builder.query<APIResponse<Enrollment>, object | void>({
      query: (params: object = {}) => ({
        url: "/enrollments",
        method: "GET",
        params
      }),
      providesTags: ["enrollments.index"]
    })
  })
});

export const { useFetchEnrollmentsQuery } = extendedApiSlice;
