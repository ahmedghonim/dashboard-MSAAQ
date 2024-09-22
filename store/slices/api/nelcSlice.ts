import { apiSlice } from "@/store/slices/api/apiSlice";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    checkWathq: builder.mutation<any, any>({
      query: (params) => ({
        url: "/verification/wathq",
        method: "POST",
        params
      })
    }),
    fetchNelcProducts: builder.query<any, object | void>({
      query: () => ({
        url: "/verification/nelc_license/products",
        method: "GET"
      }),
      providesTags: () => [{ type: "nelc_products.index", id: "LIST" }]
    }),
    nelcCheckout: builder.mutation<any, any>({
      query: (data) => ({
        url: "/verification/nelc_license/checkout",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        method: "POST",
        data: convertBooleans(data)
      })
    })
  })
});

export const { useCheckWathqMutation, useNelcCheckoutMutation, useFetchNelcProductsQuery } = extendedApiSlice;
