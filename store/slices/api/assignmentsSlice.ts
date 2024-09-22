import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Product } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchAssignments: builder.query<APIResponse<Product>, object | void>({
      query: (params: object = {}) => ({
        url: "/assignment-members",
        method: "GET",
        params
      })
    }),
    fetchAssignment: builder.query<Product, number | string>({
      query: (productId: number | string) => ({
        url: `/products/${productId}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Product }) => response.data
    }),
    updateProduct: builder.mutation<Product, Pick<Product, "id"> & Omit<DeepPartial<Product>, "id">>({
      query: ({ id, ...product }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/products/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: {
          ...convertBooleans(product)
        }
      })
    }),
    deleteProduct: builder.mutation<object, any>({
      query: ({ id, password }) => ({
        url: `/products/${id}`,
        method: "DELETE",
        data: {
          password
        }
      })
    })
  })
});

export const { useFetchAssignmentsQuery } = extendedApiSlice;
