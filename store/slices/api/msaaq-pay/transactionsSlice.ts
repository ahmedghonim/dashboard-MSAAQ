import { DeepPartial } from "react-hook-form";

import { TransactionRefundForm } from "@/pages/msaaq-pay/transactions/[transactionId]";
import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Transaction } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchTransactions: builder.query<APIResponse<Transaction>, object | void>({
      query: (params: object = {}) => ({
        url: "/msaaqpay/transactions",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "transactions.index" as const, id })),
              { type: "transactions.index", id: "LIST" }
            ]
          : [{ type: "transactions.index", id: "LIST" }]
    }),
    fetchTransaction: builder.query<Transaction, number | string>({
      query: (id: number | string) => ({
        url: `/msaaqpay/transactions/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Transaction }) => response.data,
      providesTags: (result, error, id) => [{ type: "transactions.index", id }]
    }),
    refundTransaction: builder.mutation<Transaction, Pick<Transaction, "id"> & DeepPartial<TransactionRefundForm>>({
      query: ({ id, ...data }) => ({
        url: `/msaaqpay/transactions/${id}/refund`,
        method: "POST",
        data: convertBooleans(data),
        invalidatesTags: () => [{ type: "transactions.index", id: "LIST" }]
      })
    })
  })
});

export const { useFetchTransactionQuery, useFetchTransactionsQuery, useRefundTransactionMutation } = extendedApiSlice;
