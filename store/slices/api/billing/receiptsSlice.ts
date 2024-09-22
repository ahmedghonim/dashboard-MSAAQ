import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Receipt } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchReceipts: builder.query<APIResponse<Receipt>, object | void>({
      query: (params: object = {}) => ({
        url: "/billing/receipts",
        method: "GET",
        params
      }),
      providesTags: ["receipts.index"]
    })
  })
});

export const { useFetchReceiptsQuery } = extendedApiSlice;
