import { DeepPartial } from "react-hook-form";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse } from "@/types";
import { Article } from "@/types/models/article";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchArticles: builder.query<APIResponse<Article>, object | void>({
      query: (params: object = {}) => ({
        url: "/articles",
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: "blog.index" as const, id })), { type: "blog.index", id: "LIST" }]
          : [{ type: "blog.index", id: "LIST" }]
    }),
    fetchArticle: builder.query<Article, number | string>({
      query: (id: number | string) => ({
        url: `/articles/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Article }) => response.data,
      providesTags: (result, error, id) => [{ type: "blog.index", id }]
    }),
    deleteArticle: builder.mutation<object, any>({
      query: ({ id }) => ({
        url: `/articles/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "blog.index", id: "LIST" }]
    }),
    replicateArticle: builder.mutation<Article, number>({
      query: (id) => ({
        url: `/articles/${id}/replicate`,
        method: "POST"
      }),
      invalidatesTags: (result, error, id) => [{ type: "blog.index", id: "LIST" }]
    }),
    createArticle: builder.mutation<Article, DeepPartial<Article>>({
      query: (data) => ({
        url: `/articles`,
        method: "POST",
        data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "blog.index", id: "LIST" }]
    }),
    updateArticle: builder.mutation<
      Article,
      Pick<Article, "id"> & Omit<DeepPartial<Article>, "id"> & { "deleted-thumbnail"?: number | number[] }
    >({
      query: ({ id, ...data }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/articles/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(data)
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "blog.index", id }]
    })
  })
});

export const {
  useFetchArticleQuery,
  useCreateArticleMutation,
  useFetchArticlesQuery,
  useDeleteArticleMutation,
  useReplicateArticleMutation,
  useUpdateArticleMutation
} = extendedApiSlice;
