import { DeepPartial } from "react-hook-form";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse } from "@/types";
import { BankTransfer } from "@/types/models/bank-transfer";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchBankTransfers: builder.query<APIResponse<BankTransfer>, object | void>({
      query: (params: object = {}) => ({
        url: "/bank-transfers",
        method: "GET",
        params
      }),
      providesTags: ["orders.index"]
    }),
    fetchBankTransfer: builder.query<BankTransfer, number | string>({
      query: (id: number | string) => ({
        url: `/bank-transfers/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: BankTransfer }) => response.data
    }),
    updateBankTransfer: builder.mutation<
      BankTransfer,
      Pick<BankTransfer, "id"> & Omit<DeepPartial<BankTransfer>, "id">
    >({
      query: ({ id, ...data }) => ({
        url: `/bank-transfers/${id}`,
        method: "PUT",
        data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "orders.index", id }]
    })
  })
});

export const { useFetchBankTransferQuery, useFetchBankTransfersQuery, useUpdateBankTransferMutation } =
  extendedApiSlice;
