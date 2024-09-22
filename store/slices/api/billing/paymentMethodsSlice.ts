import { DeepPartial } from "react-hook-form";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Card } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchCards: builder.query<APIResponse<Card>, object | void>({
      query: (params: object = {}) => ({
        url: "/billing/stripe/cards",
        method: "GET",
        params
      }),
      providesTags: () => [{ type: "payment-methods.index", id: "LIST" }]
    }),
    createCard: builder.mutation<Card, { payment_method_id: string }>({
      query: (data) => ({
        url: "/billing/stripe/cards",
        method: "POST",
        data
      }),
      invalidatesTags: () => [{ type: "payment-methods.index", id: "LIST" }]
    }),
    markCardAsDefault: builder.mutation<Card, { id: string }>({
      query: ({ id }) => ({
        url: `/billing/stripe/cards/${id}/mark-as-default`,
        method: "POST"
      }),
      invalidatesTags: () => [{ type: "payment-methods.index", id: "LIST" }]
    }),
    deleteCard: builder.mutation<object, DeepPartial<Card>>({
      query: ({ id }) => ({
        url: `/billing/stripe/cards/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: () => [{ type: "payment-methods.index", id: "LIST" }]
    })
  })
});

export const { useCreateCardMutation, useDeleteCardMutation, useMarkCardAsDefaultMutation, useFetchCardsQuery } =
  extendedApiSlice;
