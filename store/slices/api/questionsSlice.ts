import { DeepPartial } from "redux";

import { apiSlice } from "@/store/slices/api/apiSlice";
import { APIResponse, Question } from "@/types";

export const extendedApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchQuestions: builder.query<APIResponse<Question>, { quizId: string | number; params?: object }>({
      query: ({ quizId, ...params }) => ({
        url: `/quizzes/${quizId}/questions`,
        method: "GET",
        ...params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "questions.index" as const, id })),
              { type: "questions.index", id: "LIST" }
            ]
          : [{ type: "questions.index", id: "LIST" }]
    }),

    fetchQuestion: builder.query<Question, { quizId: number | string; id: number | string }>({
      query: ({ id, quizId }) => ({
        url: `/quizzes/${quizId}/questions/${id}`,
        method: "GET"
      }),
      transformResponse: (response: { data: Question }) => response.data,
      providesTags: (result, error, { id }) => [{ type: "questions.index", id }]
    }),
    createQuestion: builder.mutation<Question, { quizId: number | string; data: DeepPartial<Question> }>({
      query: ({ quizId, ...data }) => ({
        url: `/quizzes/${quizId}/questions`,
        method: "POST",
        ...data
      }),
      invalidatesTags: () => [{ type: "questions.index", id: "LIST" }]
    }),
    updateQuestion: builder.mutation<
      Question,
      { questionId: number | string; quizId: number | string; data: DeepPartial<Question> }
    >({
      query: ({ questionId, quizId, ...data }) => ({
        url: `/quizzes/${quizId}/questions/${questionId}`,
        method: "PUT",
        ...data
      }),
      invalidatesTags: (result, error, { questionId }) => [{ type: "questions.index", questionId }]
    }),
    sortQuestions: builder.mutation<object, any>({
      query: ({ id, ...data }) => ({
        url: `/quizzes/${id}/questions/sort`,
        method: "PUT",
        data
      }),
      invalidatesTags: () => [{ type: "questions.index", id: "LIST" }]
    }),
    replicateQuestion: builder.mutation<Question, { questionId: number | string; quizId: number | string }>({
      query: ({ quizId, questionId }) => ({
        url: `/quizzes/${quizId}/questions/${questionId}/replicate`,
        method: "POST"
      }),
      invalidatesTags: () => [{ type: "questions.index", id: "LIST" }]
    }),
    deleteQuestion: builder.mutation<object, any>({
      query: ({ quizId, id }) => ({
        url: `/quizzes/${quizId}/questions/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: () => [{ type: "questions.index", id: "LIST" }]
    })
  })
});

export const {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useFetchQuestionsQuery,
  useReplicateQuestionMutation,
  useFetchQuestionQuery,
  useDeleteQuestionMutation,
  useSortQuestionsMutation
} = extendedApiSlice;
