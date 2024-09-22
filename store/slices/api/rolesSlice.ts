import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Role } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchRoles: builder.query<APIResponse<Role>, object | void>({
      query: (params: object = {}) => ({
        url: "/roles",
        method: "GET",
        params
      })
    })
  })
});

export const { useFetchRolesQuery } = extendedApiSlice;
