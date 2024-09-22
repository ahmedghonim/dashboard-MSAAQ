import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Taxonomy } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchPages: builder.query<APIResponse<Taxonomy>, object | void>({
      query: (params: object = {}) => ({
        url: "/pages",
        method: "GET",
        params: {
          ...params
        }
      })
    })
  })
});

export const { useFetchPagesQuery } = extendedApiSlice;
