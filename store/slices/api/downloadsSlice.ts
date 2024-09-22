import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, ProductDownload } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchDownloads: builder.query<APIResponse<ProductDownload>, object | void>({
      query: (params: object = {}) => ({
        url: "/downloads",
        method: "GET",
        params
      }),
      providesTags: ["member.downloads.index"]
    })
  })
});

export const { useFetchDownloadsQuery } = extendedApiSlice;
