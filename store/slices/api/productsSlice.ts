import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Product, ProductStats } from "@/types";
import { convertBooleans } from "@/utils";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchProducts: builder.query<APIResponse<Product>, object | void>({
      query: (params: object = {}) => ({
        url: "/products",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "products.index" as const, id })),
              { type: "products.index", id: "LIST" }
            ]
          : [{ type: "products.index", id: "LIST" }]
    }),
    fetchProduct: builder.query<Product, number | string>({
      query: (productId: number | string) => ({
        url: `/products/${productId}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Product }) => response.data,
      providesTags: (result, error, id) => [{ type: "products.index", id }]
    }),
    fetchProductDownloads: builder.query<Product, { productId: number | string }>({
      query: ({ productId }) => ({
        url: `/products/${productId}/downloads`,
        method: "GET"
      }),
      transformResponse: (response: { data: Product }) => response.data
    }),
    fetchProductStats: builder.query<ProductStats, number | string>({
      query: (productId: number | string) => ({
        url: `/products/${productId}/stats`,
        method: "GET"
      }),
      transformResponse: (response: { data: ProductStats }) => response.data
    }),
    updateProduct: builder.mutation<
      Product,
      Pick<Product, "id"> & Omit<DeepPartial<Product>, "id"> & { "deleted-images"?: number | number[] }
    >({
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
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "products.index", id }]
    }),
    createProduct: builder.mutation<Product, DeepPartial<Product>>({
      query: (data) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/products`,
        method: "POST",
        data: {
          ...convertBooleans(data)
        }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "products.index", id: "LIST" }]
    }),
    deleteProduct: builder.mutation<object, any>({
      query: ({ id, password }) => ({
        url: `/products/${id}`,
        method: "DELETE",
        data: {
          password
        }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "products.index", id: "LIST" }]
    }),
    replicateProduct: builder.mutation<Product, number>({
      query: (id) => ({
        url: `/products/${id}/replicate`,
        method: "POST"
      }),
      invalidatesTags: (result, error, id) => [{ type: "products.index", id: "LIST" }]
    }),
    googleCalendarCheck: builder.mutation<void, { id: number | string; userId: number | string }>({
      query: ({ id, userId }) => ({
        url: `/products/${id}/check-google-calendar/${userId}`,
        method: "POST"
      })
    })
  })
});

export const {
  useFetchProductsQuery,
  useFetchProductQuery,
  useFetchProductDownloadsQuery,
  useFetchProductStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useReplicateProductMutation,
  useDeleteProductMutation,
  useGoogleCalendarCheckMutation
} = extendedApiSlice;
