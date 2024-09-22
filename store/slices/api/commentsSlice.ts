import { DeepPartial } from "redux";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Comment } from "@/types";
import { convertBooleans } from "@/utils";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchComments: builder.query<APIResponse<Comment>, object | void>({
      query: (params: object = {}) => ({
        url: `/comments`,
        method: "GET",
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "comments.index" as const, id })),
              { type: "comments.index", id: "LIST" }
            ]
          : [{ type: "comments.index", id: "LIST" }]
    }),
    updateComment: builder.mutation<Comment, Pick<Comment, "id"> & Omit<DeepPartial<Comment>, "id">>({
      query: ({ id, ...comment }) => ({
        headers: {
          "Content-Type": "multipart/form-data"
        },
        url: `/comments/${id}`,
        method: "POST",
        params: {
          _method: "PUT"
        },
        data: convertBooleans(comment)
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "comments.index", id },
        { type: "reviews.index", id: "LIST" }
      ]
    }),
    replyComment: builder.mutation<Comment, { id: number }>({
      query: (data) => ({
        url: `/comments/${data.id}/replay`,
        method: "POST",
        data: data
      }),
      invalidatesTags: () => [{ type: "comments.index", id: "LIST" }]
    }),
    deleteComment: builder.mutation<{ success: boolean; id: number }, { id: number }>({
      query: ({ id }) => ({
        url: `/comments/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: () => [
        { type: "comments.index", id: "LIST" },
        { type: "reviews.index", id: "LIST" }
      ]
    })
  })
});

export const { useFetchCommentsQuery, useReplyCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation } =
  extendedApiSlice;
