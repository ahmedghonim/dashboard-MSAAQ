import { DeepPartial } from "redux";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Comment } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchReviews: builder.query<APIResponse<Comment>, object | void>({
      query: (params: object = {}) => ({
        url: `/reviews`,
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "reviews.index" as const, id })),
              { type: "reviews.index", id: "LIST" }
            ]
          : [{ type: "reviews.index", id: "LIST" }]
    }),
    updateReview: builder.mutation<Comment, Pick<Comment, "id"> & Omit<DeepPartial<Comment>, "id">>({
      query: ({ id, ...comment }) => ({
        url: `/reviews/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(comment)
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "reviews.index", id }]
    }),
    reviewReply: builder.mutation<Comment, { id: number }>({
      query: (data) => ({
        url: `/reviews/${data.id}/reply`,
        method: "POST",
        data: data
      }),
      invalidatesTags: () => [{ type: "reviews.index", id: "LIST" }]
    }),
    deleteReview: builder.mutation<{ success: boolean; id: number }, { id: number }>({
      query: ({ id }) => ({
        url: `/reviews/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: () => [{ type: "reviews.index", id: "LIST" }]
    })
  })
});

export const { useFetchReviewsQuery, useReviewReplyMutation, useUpdateReviewMutation, useDeleteReviewMutation } =
  extendedApiSlice;
