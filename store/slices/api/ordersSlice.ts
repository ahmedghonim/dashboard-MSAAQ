import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Order } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchOrders: builder.query<APIResponse<Order>, object | void>({
      query: (params: object = {}) => ({
        url: "/orders",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "orders.index" as const, id })),
              { type: "orders.index", id: "LIST" }
            ]
          : [{ type: "orders.index", id: "LIST" }]
    }),
    fetchOrder: builder.query<Order, number | string>({
      query: (id: number | string) => ({
        url: `/orders/${id}`,
        method: "GET"
      }),
      providesTags: (result, error, id) => [{ type: "orders.index", id }],
      transformResponse: (response: { data: Order }) => response.data
    })
  })
});

export const { useFetchOrderQuery, useFetchOrdersQuery } = extendedApiSlice;
